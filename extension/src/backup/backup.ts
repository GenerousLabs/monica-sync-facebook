import { getFriends } from "../facebook/friends";
import { getState } from "../state";
import { getByIdOrThrow } from "../utils";

const startBackup = async (doc: Document) => {
  const friends = await getFriends();
  getByIdOrThrow<HTMLInputElement>(doc, "friendsList").value =
    JSON.stringify(friends);

  const { facebookFriendsToScrape, ...settings } = await getState();
  getByIdOrThrow<HTMLInputElement>(doc, "settings").value =
    JSON.stringify(settings);
};

globalThis.setTimeout(() => {
  startBackup(globalThis.window.document);
}, 300);
