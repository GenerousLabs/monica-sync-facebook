import { setFriendMonicaId } from "../facebook/friends";
import { getPhoto } from "../facebook/photos";
import { addLogLine } from "../shared.log";
import { FacebookFriend, MonicaFriend } from "../shared.types";
import {
  createFriendOnMonica,
  doesMonicaFriendHavePhoto,
  getFriendFromMonicaByFacebookProfile,
  getFriendFromMonicaByName,
  getMonicaFriendById,
  MonicaParams,
  postPhotoToMonica,
  setMonicaContactFacebookProfileUrl,
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

export const tryToFindMonicaFriendId = async ({
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

  const monicaFriendByProfileId = await getFriendFromMonicaByFacebookProfile({
    monicaParams,
    friend,
  });

  if (typeof monicaFriendByProfileId !== "undefined") {
    const { id } = monicaFriendByProfileId;
    await setFriendMonicaId({ friend, id });
    return id;
  }

  const monicaFriendByName = await getFriendFromMonicaByName({
    monicaParams,
    friend,
  });

  if (typeof monicaFriendByName !== "undefined") {
    const { id } = monicaFriendByName;
    await setFriendMonicaId({ friend, id });
    return id;
  }

  return;
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

export const syncFacebookProfileUrlToMonica = async ({
  monicaParams,
  monicaFriend,
  friend,
}: {
  monicaParams?: MonicaParams;
  monicaFriend: MonicaFriend;
  friend: FacebookFriend;
}) => {
  const { contact_fields } = monicaFriend;
  const facebookProfileUrl = (contact_fields || []).find(
    (field) => field.contact_field_type.name.toLowerCase() === "facebook"
  );

  if (typeof facebookProfileUrl === "undefined") {
    await setMonicaContactFacebookProfileUrl({
      monicaParams,
      monicaFriend,
      friend,
    });
    return;
  }

  if (facebookProfileUrl.content !== friend.profileUrl) {
    await addLogLine(
      `ERROR: Found monica contact with incorrect facebook profile url. #4MgbJv Friend: ${friend.name} ${friend.profileUrl}`
    );
    throw new Error(
      "FATAL: Monica contact has incorrect facebook profile url. #iXROVD"
    );
  }
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

export const syncFriendToMonica = async ({
  monicaParams,
  monicaId,
  friend,
}: {
  monicaParams?: MonicaParams;
  monicaId: number;
  friend: FacebookFriend;
}) => {
  const monicaFriend = await getMonicaFriendById({
    monicaParams,
    id: monicaId,
  });

  await syncFacebookProfileUrlToMonica({ monicaParams, monicaFriend, friend });

  await syncFriendDataToMonica({ monicaParams, monicaFriend, friend });

  const photoAsBlob = await getPhoto({ friend });
  if (typeof photoAsBlob !== "undefined") {
    await syncProfilePictureToMonica({
      monicaParams,
      monicaFriend,
      photoAsBlob,
    });
  }
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
