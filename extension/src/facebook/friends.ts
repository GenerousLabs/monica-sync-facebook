import { FacebookFriend } from "../shared.types";

const FRIENDS_KEY = "__facebookFriends";

export const getFriends = async () => {
  const result = await browser.storage.local.get(FRIENDS_KEY);
  const friends = result[FRIENDS_KEY] as FacebookFriend[];

  if (typeof friends === "undefined") {
    return [];
  }

  return friends;
};

export const getSyncedFriends = (friends: FacebookFriend[]) => {
  const synced = friends.filter(
    (friend) => typeof friend.monicaId !== "undefined"
  );
  return synced;
};

export const getScrapedFriends = (friends: FacebookFriend[]) => {
  const scraped = friends.filter(
    (friend) => typeof friend.tableData !== "undefined"
  );
  return scraped;
};

export const getUnmatchedFriends = (friends: FacebookFriend[]) => {
  const unmatched = friends.filter(
    ({ tableData, monicaId }) =>
      typeof tableData !== "undefined" && typeof monicaId === "undefined"
  );
  return unmatched;
};

export const setFriends = async (friends: FacebookFriend[]) => {
  const set = {
    [FRIENDS_KEY]: friends,
  };
  await browser.storage.local.set(set);
};

export const setFriend = async (friend: FacebookFriend) => {
  const friends = await getFriends();

  const friendEntries = friends.map((friend) => [friend.profileUrl, friend]);
  const friendsMap = Object.fromEntries(friendEntries) as {
    [profileUrl: string]: FacebookFriend;
  };

  const updatedFriendMap = { ...friendsMap, [friend.profileUrl]: friend };

  const keys = Object.keys(updatedFriendMap);

  const updatedFriends = keys.map((key) => updatedFriendMap[key]);

  await setFriends(updatedFriends);
};

export const setFriendTableData = async ({
  friend,
  data,
}: {
  friend: FacebookFriend;
  data: Required<FacebookFriend>["tableData"]["data"];
}) => {
  const tableData = { data, updatedAtMs: Date.now() };
  const updatedFriend = { ...friend, tableData };
  await setFriend(updatedFriend);
  return updatedFriend;
};

export const setFriendMonicaId = async ({
  friend,
  id,
}: {
  friend: FacebookFriend;
  id: number;
}) => {
  const updatedFriend = { ...friend, monicaId: id };
  await setFriend(updatedFriend);
};

export const setFriendsToSyncToMonica = async (profileUrlsToSync: string[]) => {
  const friends = await getFriends();
  const updatedFriends = friends.map((friend) => {
    const { profileUrl } = friend;
    if (profileUrlsToSync.indexOf(profileUrl) === -1) {
      return { ...friend };
    }
    return { ...friend, forceSyncToMonica: true };
  });
  await setFriends(updatedFriends);
};
