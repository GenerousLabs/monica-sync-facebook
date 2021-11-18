import { syncFriendDataToMonica } from "../monica/monica";
import { getState, setFacebookFriendsToScrape } from "../state";
import { randomDelay } from "../utils";
import { getFriends } from "./friends";
import { captureTableData } from "./mbasicAboutPageScraping";
import {
  clickAboutLink,
  isAboutPage,
  isProfilePage,
} from "./mbasicPageParsing";

const MBASIC_FACEBOOK_URL = `https://mbasic.facebook.com/`;

if (globalThis.confirm("Run TEMPORARY test? #yi85uh")) {
  (async () => {
    const friends = await getFriends();
    const friend = friends.find(
      (f) => globalThis.window.location.href.indexOf(f.profileUrl) !== -1
    );
    if (typeof friend === "undefined") {
      globalThis.alert("Cannot find current friend #BtVl3b");
      return;
    }
    await syncFriendDataToMonica({ friend });
  })();
}

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

const mbasicStart = async (win: Window) => {
  const { location, document } = win;

  const { facebookFriendsToScrape } = await getState();
  if (facebookFriendsToScrape.length === 0) {
    return;
  }

  const friend = facebookFriendsToScrape[0];

  // - is this the user's about page?
  //    - then capture their data
  //    - remove them from the list to be scraped
  //    - click to the next friend's profile page
  if (isAboutPage({ friend, location })) {
    await captureTableData({ friend, document });
    await markFriendAsScraped();
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
