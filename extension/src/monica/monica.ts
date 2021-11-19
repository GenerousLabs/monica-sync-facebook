import { FacebookFriend, MonicaFriend } from "../shared.types";
import { getMonicaCountryCode } from "../utils";
import {
  createFriendOnMonica,
  doesMonicaFriendHavePhoto,
  getFriendFromMonicaByFacebookProfile,
  getMonicaFriendById,
  MonicaParams,
  postPhotoToMonica,
  sendMonicaPostOrPutRequest,
  sendMonicaRequest,
} from "./api";

const MONICA_FACEBOOK_ADDRESS_NAME = "Facebook";

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

export const updateMonicaLocation = async ({
  monicaParams,
  friend,
  monicaFriend,
}: {
  monicaParams?: MonicaParams;
  friend: FacebookFriend;
  monicaFriend: MonicaFriend;
}) => {
  // Does the user have a location from Facebook?
  const { tableData } = friend;
  if (typeof tableData === "undefined") {
    return;
  }
  const { data } = tableData;
  const currentCityData = data.find(({ label }) => {
    const l = label.toLowerCase();
    return l === "current city" || l === "lives in";
  });
  if (typeof currentCityData === "undefined") {
    return;
  }

  const pieces = currentCityData.value.split(",");
  if (pieces.length !== 2) {
    return;
  }
  const [city, country] = pieces.map((p) => p.trim());

  const { addresses } = monicaFriend;
  const address = addresses.find(
    (a) => a.name?.toLowerCase() === MONICA_FACEBOOK_ADDRESS_NAME.toLowerCase()
  );

  const monicaCountryCode = getMonicaCountryCode(country);

  const countryOrProvince =
    typeof monicaCountryCode !== "undefined"
      ? {
          country: monicaCountryCode,
        }
      : { province: country };

  if (typeof address === "undefined") {
    const url = `/addresses`;
    const body = {
      ...countryOrProvince,
      name: MONICA_FACEBOOK_ADDRESS_NAME,
      city,
      contact_id: monicaFriend.id,
    };
    await sendMonicaPostOrPutRequest({
      monicaParams,
      url,
      method: "post",
      body,
    });
    return;
  }

  if (address.city?.toLowerCase() === city.toLowerCase()) {
    return;
  }

  const url = `/addresses/${address.id}`;
  const body = {
    name: MONICA_FACEBOOK_ADDRESS_NAME,
    city,
    country: monicaCountryCode,
    contact_id: monicaFriend.id,
  };
  await sendMonicaPostOrPutRequest({
    monicaParams,
    url,
    method: "put",
    body,
  });
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
  // Does this user have a hometown?
  await updateMonicaLocation({ monicaParams, monicaFriend, friend });
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
