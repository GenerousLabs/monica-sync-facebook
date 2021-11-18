import { getFriends } from "../facebook/friends";
import { getByIdOrThrow } from "../utils";

const startBackup = async (doc: Document) => {
  const friends = await getFriends();
  getByIdOrThrow<HTMLInputElement>(doc, "friendsList").value =
    JSON.stringify(friends);
};

globalThis.setTimeout(() => {
  startBackup(globalThis.window.document);
}, 300);
