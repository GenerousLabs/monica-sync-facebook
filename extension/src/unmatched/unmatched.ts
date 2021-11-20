import { getFriends, getUnmatchedFriends } from "../facebook/friends";
import { getByIdOrThrow } from "../utils";

const unmatchedStart = async (doc: Document) => {
  const friends = await getFriends();
  const unmatched = getUnmatchedFriends(friends);
  const elements = unmatched.map((friend) => {
    const li = doc.createElement("li");
    li.innerText = `${friend.name} ${friend.profileUrl}`;
    return li;
  });
  const friendsUl = getByIdOrThrow(doc, "friends");
  elements.forEach((element) => friendsUl.appendChild(element));
};

globalThis.setTimeout(() => {
  unmatchedStart(globalThis.document);
}, 300);
