import { setFacebookFriendsUrl } from "../state";
import { getSanitisedFriendsListUrl } from "../urls";
import { getByIdOrThrow } from "../utils";

const startScrape = async () => {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  if (tabs.length !== 1) {
    throw new Error("FATAL: Failed to find exactly 1 current tab #Ch6ToS");
  }
  const { url } = tabs[0];

  if (typeof url !== "string") {
    globalThis.alert(
      "Please try that again with your Facebook friends list in the current tab. #PMDtW8"
    );
    return;
  }

  const facebookFriendsUrl = getSanitisedFriendsListUrl(url);

  if (
    !globalThis.confirm(
      `Is this your Facebook friends list?\n\n${facebookFriendsUrl}`
    )
  ) {
    globalThis.alert(
      `Please click this button when your Facebook friends list is the current tab.`
    );
    return;
  }

  await setFacebookFriendsUrl({ facebookFriendsUrl });

  if (
    !globalThis.confirm(
      "Do you want to start scraping your friends list now? #mveUpB"
    )
  ) {
    return;
  }

  await browser.tabs.reload();
};

const bindButtons = (doc: Document) => {
  getByIdOrThrow(doc, "scrapeFriendsList").onclick = startScrape;
};

const popupStart = async (doc: Document) => {
  bindButtons(doc);
};

globalThis.setTimeout(() => {
  popupStart(globalThis.document);
}, 300);
