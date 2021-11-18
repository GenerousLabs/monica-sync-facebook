import { FacebookFriend } from "../shared.types";
import { getState } from "../state";
import {
  clickAboutLink,
  isAboutPage,
  isProfilePage,
} from "./mbasicPageParsing";

const MBASIC_FACEBOOK_URL = `https://mbasic.facebook.com/`;

const goToNextFriend = async ({
  friend,
  win,
}: {
  friend: FacebookFriend;
  win: Window;
}) => {
  const url = `${MBASIC_FACEBOOK_URL}${friend.profileUrl}`;
  win.location.href = url;
};

const mbasicStart = async (win: Window) => {
  const { facebookFriendsToScrape } = await getState();
  if (facebookFriendsToScrape.length === 0) {
    return;
  }

  const friend = facebookFriendsToScrape[0];

  // - is this the user's about page?
  //    - then capture their data
  //    - remove them from the list to be scraped
  //    - click to the next friend's profile page
  if (isAboutPage(win.location)) {
    globalThis.alert("Ready to scrape #CbXtvL");
  } else if (isProfilePage(win.location)) {
    clickAboutLink(win.document);
  } else {
    goToNextFriend({ friend, win });
  }
};

globalThis.setTimeout(() => {
  mbasicStart(globalThis.window);
}, 300);
