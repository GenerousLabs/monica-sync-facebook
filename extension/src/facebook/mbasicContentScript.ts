import {
  getOrCreateMonicaFriend,
  syncFriendDataToMonica,
  syncProfilePictureToMonica,
} from "../monica/monica";
import {
  ABOUT_PAGE_FIXED_DELAY_MS,
  ABOUT_PAGE_RANDOM_DELAY_MS,
  GETTING_STARTED_FIXED_DELAY_MS,
  GETTING_STARTED_RANDOM_DELAY_MS,
  PROFILE_PAGE_FIXED_DELAY_MS,
  PROFILE_PAGE_RANDOM_DELAY_MS,
  RATE_LIMIT_DELAY_BACKUP_MULTIPLIER,
  STARTING_RATE_LIMIT_SECONDS,
} from "../shared.config";
import { MBASIC_FACEBOOK_URL } from "../shared.constants";
import { addLogLine } from "../shared.log";
import { FacebookFriend } from "../shared.types";
import {
  getState,
  setFacebookFriendsToScrape,
  setRateLimitDelay,
} from "../state";
import { delay, getBlobFromSrc, randomDelay } from "../utils";
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
  if (typeof rateLimitHeading !== "undefined") {
    return true;
  }

  const strongs = doc.getElementsByTagName("strong");
  const strongsArray = Array.from(strongs);
  const strong = strongsArray.find(
    (strong) =>
      strong.innerText.toLowerCase().indexOf("something went wrong") !== -1
  );
  if (typeof strong !== "undefined") {
    return true;
  }

  return false;
};

const findProfilePicture = ({
  doc,
  friend,
}: {
  doc: Document;
  friend: FacebookFriend;
}) => {
  const imgs = doc.getElementsByTagName("img");
  const imgsArray = Array.from(imgs);
  const img = imgsArray.find(
    (img) => img.alt.toLowerCase().indexOf("profile picture") !== -1
  );
  if (typeof img === "undefined") {
    addLogLine(
      `Failed to find profile image #PE3uN9 Friend: ${friend.profileUrl}`
    );
    throw new Error("FATAL: Failed to find profile image");
  }
  return img;
};

const getProfilePictureAsDataBlob = async ({
  doc,
  friend,
}: {
  doc: Document;
  friend: FacebookFriend;
}) => {
  const img = findProfilePicture({ doc, friend });
  const blob = await getBlobFromSrc(img.src);
  return blob;
};

const mbasicStart = async (win: Window) => {
  const { location, document } = win;
  const doc = document;

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

  if (isAboutPage({ friend, location })) {
    await addLogLine(`Found about page #x1gM8O. Friend: ${friend.profileUrl}`);
    const updatedFriend = await captureTableData({ friend, document });
    await markFriendAsScraped();
    const monicaFriend = await getOrCreateMonicaFriend({ friend });
    try {
      await syncFriendDataToMonica({ friend: updatedFriend, monicaFriend });
    } catch (error) {}
    try {
      const photoAsBlob = await getProfilePictureAsDataBlob({ doc, friend });
      await syncProfilePictureToMonica({
        monicaFriend,
        photoAsBlob,
      });
    } catch (error) {}
    await delay(ABOUT_PAGE_FIXED_DELAY_MS);
    await randomDelay(ABOUT_PAGE_RANDOM_DELAY_MS);
    await goToNextFriend({ win });
  } else if (isProfilePage({ friend, location })) {
    await addLogLine(
      `Found profile page #wtOPrK. Friend: ${friend.profileUrl}`
    );
    await delay(PROFILE_PAGE_FIXED_DELAY_MS);
    await randomDelay(PROFILE_PAGE_RANDOM_DELAY_MS);
    clickAboutLink(document);
  } else {
    await addLogLine(`Starting crawl. #6zOw4E`);
    await delay(GETTING_STARTED_FIXED_DELAY_MS);
    await randomDelay(GETTING_STARTED_RANDOM_DELAY_MS);
    await goToNextFriend({ win });
  }
};

globalThis.setTimeout(() => {
  mbasicStart(globalThis.window);
}, 300);
