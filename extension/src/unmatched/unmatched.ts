import {
  getFriends,
  selectUnmatchedFriends,
  setFriendsToSyncToMonica,
} from "../facebook/friends";
import { syncFriendToMonica, tryToFindMonicaFriendId } from "../monica/monica";
import { delay, getByIdOrThrow } from "../utils";

const syncToMonicaFactory = (doc: Document) => async () => {
  const inputs = doc.querySelectorAll<HTMLInputElement>("input[type=checkbox]");
  const checkedInputs = Array.from(inputs).filter((input) => input.checked);
  const profileUrlsToSync = checkedInputs.map((input) => input.value);
  await setFriendsToSyncToMonica(profileUrlsToSync);
  globalThis.alert("Friends set to sync. #0TF8GR");
};

const tryToSyncAgainToMonica = async () => {
  const friends = await getFriends();
  const unmatched = selectUnmatchedFriends(friends);

  for (const friend of unmatched) {
    const monicaId = await tryToFindMonicaFriendId({ friend });
    if (typeof monicaId !== "undefined") {
      // Wait 1s if we found a match to avoid monica rate limiting
      await delay(1e3);
      await syncFriendToMonica({ friend, monicaId });
    }
    // Wait between attempts to sync to avoid monica's rate limits
    await delay(1e3);
  }
};

const unmatchedStart = async (doc: Document) => {
  const friends = await getFriends();
  const unmatched = selectUnmatchedFriends(friends);
  const elements = unmatched.map((friend) => {
    const { name, profileUrl } = friend;
    const li = doc.createElement("li");
    li.innerHTML = `<input type="checkbox" value="${profileUrl}" /> ${name} <input type="text" value="${friend.profileUrl}" readonly="readonly" /">`;
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
  try {
    getByIdOrThrow(doc, "retry").onclick = async () => {
      globalThis.alert("Starting now. Please wait. #2HIdnr");
      try {
        await tryToSyncAgainToMonica();
      } catch (error) {
        globalThis.alert(
          `Error: The process encountered an error. #yAlv47\n${
            (error as Error)?.message
          }`
        );
        return;
      }
      globalThis.alert("Finished. #iH6kP2");
      globalThis.document.location.reload();
    };
  } catch (error) {}
};

globalThis.setTimeout(() => {
  bindButtons(globalThis.document);
  unmatchedStart(globalThis.document);
}, 300);
