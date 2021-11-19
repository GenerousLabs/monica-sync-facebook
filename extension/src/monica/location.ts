import { MONICA_FACEBOOK_ADDRESS_NAME } from "../shared.constants";
import { FacebookFriend, MonicaFriend } from "../shared.types";
import { getMonicaCountryCode } from "../utils";
import { MonicaParams, sendMonicaPostOrPutRequest } from "./api";

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
