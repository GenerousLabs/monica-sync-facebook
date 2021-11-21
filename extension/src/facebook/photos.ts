import localforage from "localforage";
import { FacebookFriend } from "../shared.types";

const friendToKey = (friend: FacebookFriend) => {
  return `fbphoto_${friend.profileUrl}`;
};

export const savePhoto = async ({
  photo,
  friend,
}: {
  photo: Blob;
  friend: FacebookFriend;
}) => {
  const key = friendToKey(friend);
  await localforage.setItem(key, photo);
};

export const getPhoto = async ({ friend }: { friend: FacebookFriend }) => {
  const key = friendToKey(friend);
  const photo = (await localforage.getItem(key)) as Blob | null;

  if (photo === null) {
    return;
  }
  return photo;
};

export const removePhoto = async ({ friend }: { friend: FacebookFriend }) => {
  const key = friendToKey(friend);
  await localforage.removeItem(key);
};
