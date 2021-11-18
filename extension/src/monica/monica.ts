import { FacebookFriend, MonicaFriend } from "../shared.types";
import { getMonicaCountryCode } from "../utils";
import {
  createFriendOnMonica,
  getFriendFromMonicaByFacebookProfile,
  getMonicaFriendById,
  MonicaParams,
  sendMonicaPostOrPutRequest,
} from "./api";

const MONICA_FACEBOOK_ADDRESS_NAME = "Facebook";

const monicaPostFriend = async ({
  friend,
}: {
  monicaParams: MonicaParams;
  friend: FacebookFriend;
}) => {
  //
};

const monicaPutFriend = async ({
  monicaParams: { monicaApiUrl, monicaApiToken },
  friend,
  monicaFriend,
}: {
  monicaParams: MonicaParams;
  friend: FacebookFriend;
  monicaFriend: object;
}) => {
  const { id } = monicaFriend as { id: string };
  const url = `${monicaApiUrl}/contacts/${id}`;
  const response = fetch(url);
  // Do something
};

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

const getOrCreateMonicaFriend = async ({
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

  if (typeof address === "undefined") {
    const url = `/addresses`;
    const body = {
      name: MONICA_FACEBOOK_ADDRESS_NAME,
      city,
      country: monicaCountryCode,
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
    method: "post",
    body,
  });
};

export const syncFriendDataToMonica = async ({
  monicaParams,
  friend,
}: {
  monicaParams?: MonicaParams;
  friend: FacebookFriend;
}) => {
  /**
   * - Get monica friend id
   *   - Create if does not exist
   * - Update details
   */
  const monicaFriend = await getOrCreateMonicaFriend({ monicaParams, friend });

  // Does this user have a hometown?
  await updateMonicaLocation({ friend, monicaFriend });
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
