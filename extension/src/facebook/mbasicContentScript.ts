import { syncFriendDataToMonica } from "../monica/monica";
import { MBASIC_FACEBOOK_URL } from "../shared.constants";
import {
  getState,
  setFacebookFriendsToScrape,
  setRateLimitDelay,
} from "../state";
import { delay, randomDelay } from "../utils";
import { captureTableData } from "./mbasicAboutPageScraping";
import {
  clickAboutLink,
  isAboutPage,
  isProfilePage,
} from "./mbasicPageParsing";

const goToNextFriend = async ({ win }: { win: Window }) => {
  const { facebookFriendsToScrape } = await getState();
  if (facebookFriendsToScrape.length === 0) {
    return;
  }
  const friend = facebookFriendsToScrape[0];
  const url = `${MBASIC_FACEBOOK_URL}${friend.profileUrl}`;
  win.location.href = url;
};

const markFriendAsScraped = async () => {
  const { facebookFriendsToScrape } = await getState();
  const updated = facebookFriendsToScrape.slice(1);
  await setFacebookFriendsToScrape(updated);
};

const isRateLimitingPage = (doc: Document) => {
  const h2s = doc.getElementsByTagName("h2");
  const h2sArray = Array.from(h2s);
  const rateLimitHeading = h2sArray.find(
    (h2) =>
      h2.innerText.toLowerCase() === "you can't use this feature right now"
  );
  if (typeof rateLimitHeading === "undefined") {
    return false;
  }
  return true;
};

const mbasicStart = async (win: Window) => {
  const { location, document } = win;

  const { facebookFriendsToScrape, rateLimitingDelaySeconds } =
    await getState();
  if (facebookFriendsToScrape.length === 0) {
    return;
  }

  if (isRateLimitingPage(win.document)) {
    const delaySeconds =
      rateLimitingDelaySeconds === 0
        ? STARTING_RATE_LIMIT_SECONDS
        : rateLimitingDelaySeconds * RATE_LIMIT_DELAY_BACKUP_MULTIPLIER;
    await setRateLimitDelay(delaySeconds);
    await delay(delaySeconds * 1e3);

    win.document.location.reload();
    return;
  } else {
    if (rateLimitingDelaySeconds !== 0) {
      await setRateLimitDelay(0);
    }
  }

  const friend = facebookFriendsToScrape[0];

  // - is this the user's about page?
  //    - then capture their data
  //    - remove them from the list to be scraped
  //    - click to the next friend's profile page
  if (isAboutPage({ friend, location })) {
    const updatedFriend = await captureTableData({ friend, document });
    await markFriendAsScraped();
    await syncFriendDataToMonica({ friend: updatedFriend });
    await delay(ABOUT_PAGE_FIXED_DELAY_MS);
    await randomDelay(ABOUT_PAGE_RANDOM_DELAY_MS);
    await goToNextFriend({ win });
  } else if (isProfilePage({ friend, location })) {
    await delay(PROFILE_PAGE_FIXED_DELAY_MS);
    await randomDelay(PROFILE_PAGE_RANDOM_DELAY_MS);
    clickAboutLink(document);
  } else {
    await delay(GETTING_STARTED_FIXED_DELAY_MS);
    await randomDelay(GETTING_STARTED_RANDOM_DELAY_MS);
    await goToNextFriend({ win });
  }
};

globalThis.setTimeout(() => {
  mbasicStart(globalThis.window);
}, 300);
