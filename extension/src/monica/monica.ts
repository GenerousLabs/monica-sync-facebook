import { FacebookFriend, MonicaFriend } from "../shared.types";
import {
  createFriendOnMonica,
  doesMonicaFriendHavePhoto,
  getFriendFromMonicaByFacebookProfile,
  getMonicaFriendById,
  MonicaParams,
  postPhotoToMonica,
} from "./api";
import { updateMonicaLocation } from "./location";
import { updateMonicaFacebookNote } from "./note";

const getMonicaFriendId = async ({
  monicaParams,
  friend,
}: {
  monicaParams?: MonicaParams;
  friend: FacebookFriend;
}) => {
  const { monicaId } = friend;

  if (typeof monicaId !== "undefined") {
    return monicaId;
  }

  const monicaFriend = await getFriendFromMonicaByFacebookProfile({
    monicaParams,
    friend,
  });

  if (typeof monicaFriend !== "undefined") {
    const { id } = monicaFriend;
    return id;
  }

  const { id } = await createFriendOnMonica({ monicaParams, friend });
  return id;
};

export const getOrCreateMonicaFriend = async ({
  monicaParams,
  friend,
}: {
  monicaParams?: MonicaParams;
  friend: FacebookFriend;
}) => {
  const { monicaId } = friend;

  if (typeof monicaId === "number") {
    const monicaFriend = await getMonicaFriendById({
      monicaParams,
      id: monicaId,
    });
    return monicaFriend;
  }

  const monicaFriend = await getFriendFromMonicaByFacebookProfile({
    monicaParams,
    friend,
  });

  if (typeof monicaFriend !== "undefined") {
    return monicaFriend;
  }

  const createdFriend = await createFriendOnMonica({ monicaParams, friend });
  return createdFriend;
};

export const syncFriendDataToMonica = async ({
  monicaParams,
  monicaFriend,
  friend,
}: {
  monicaParams?: MonicaParams;
  monicaFriend: MonicaFriend;
  friend: FacebookFriend;
}) => {
  await updateMonicaLocation({ monicaParams, monicaFriend, friend });
  await updateMonicaFacebookNote({ monicaParams, monicaFriend, friend });
};

export const syncProfilePictureToMonica = async ({
  monicaParams,
  monicaFriend,
  photoAsBlob,
}: {
  monicaParams?: MonicaParams;
  monicaFriend: MonicaFriend;
  photoAsBlob: Blob;
}) => {
  const hasPhoto = await doesMonicaFriendHavePhoto({
    monicaParams,
    monicaFriend,
  });
  if (hasPhoto) {
    return;
  }
  await postPhotoToMonica({ monicaParams, monicaFriend, photoAsBlob });
};

export const pushToMonica = async () => {
  return;
  // const monicaParams = await getMonicaParams();
  // const friends = await getFriends();

  // for (const friend of friends) {
  //   const monicaFriend = await getFriendFromMonica({ monicaParams, friend });
  //   if (typeof monicaFriend === "undefined") {
  //     await monicaPostFriend({ monicaParams, friend });
  //   } else {
  //     await monicaPutFriend({ monicaParams, friend, monicaFriend });
  //   }
  // }
};
