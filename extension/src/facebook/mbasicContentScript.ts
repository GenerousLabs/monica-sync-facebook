import { syncFriendDataToMonica } from "../monica/monica";
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

const MBASIC_FACEBOOK_URL = `https://mbasic.facebook.com/`;
const STARTING_RATE_LIMIT_SECONDS = 7;
const RATE_LIMIT_DELAY_BACKUP_MULTIPLIER = 3;

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
    await randomDelay(5e3);
    await goToNextFriend({ win });
  } else if (isProfilePage({ friend, location })) {
    await randomDelay(2e3);
    clickAboutLink(document);
  } else {
    await randomDelay(3e3);
    await goToNextFriend({ win });
  }
};

globalThis.setTimeout(() => {
  mbasicStart(globalThis.window);
}, 300);
