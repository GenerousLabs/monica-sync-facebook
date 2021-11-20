import {
  getFriends,
  getUnmatchedFriends,
  setFriendsToSyncToMonica,
} from "../facebook/friends";
import { getByIdOrThrow } from "../utils";

const syncToMonicaFactory = (doc: Document) => async () => {
  const inputs = doc.querySelectorAll<HTMLInputElement>("input[type=checkbox]");
  const checkedInputs = Array.from(inputs).filter((input) => input.checked);
  const profileUrlsToSync = checkedInputs.map((input) => input.value);
  await setFriendsToSyncToMonica(profileUrlsToSync);
  globalThis.alert("Friends set to sync. #0TF8GR");
};

const unmatchedStart = async (doc: Document) => {
  const friends = await getFriends();
  const unmatched = getUnmatchedFriends(friends);
  const elements = unmatched.map((friend) => {
    const { name, profileUrl } = friend;
    const li = doc.createElement("li");
    li.innerHTML = `<input type="checkbox" value="${profileUrl}" /> ${name} <input type="text" value="${friend.profileUrl}" /">`;
    return li;
  });
  const friendsUl = getByIdOrThrow(doc, "friends");
  elements.forEach((element) => friendsUl.appendChild(element));
};

const bindButtons = (doc: Document) => {
  try {
    getByIdOrThrow(doc, "selectAll").onclick = () => {
      document
        .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
        .forEach((input) => (input.checked = true));
    };
  } catch (error) {}
  try {
    getByIdOrThrow(doc, "selectNone").onclick = () => {
      document
        .querySelectorAll<HTMLInputElement>("input[type=checkbox]")
        .forEach((input) => (input.checked = false));
    };
  } catch (error) {}
  try {
    getByIdOrThrow(doc, "syncToMonica").onclick = syncToMonicaFactory(doc);
  } catch (error) {}
};

globalThis.setTimeout(() => {
  bindButtons(globalThis.document);
  unmatchedStart(globalThis.document);
}, 300);
