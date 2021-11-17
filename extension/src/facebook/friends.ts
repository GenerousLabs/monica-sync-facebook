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

export const setFriends = async (friends: FacebookFriend[]) => {
  const set = {
    [FRIENDS_KEY]: friends,
  };
  await browser.storage.local.set(set);
};
