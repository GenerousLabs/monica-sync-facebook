import { setFriendMonicaId } from "../facebook/friends";
import {
  FacebookFriend,
  MonicaContactField,
  MonicaContactFieldType,
  MonicaFriend,
  State,
} from "../shared.types";
import { getState } from "../state";
import { trimTrailingSlash } from "../utils";

export type MonicaParams = Required<
  Pick<State, "monicaApiUrl" | "monicaApiToken">
>;

type MonicaArrayResponse<T> = {
  data: T[];
  links: {
    first: string;
    last: string;
    next: string | null;
    prev: string | null;
  };
  meta: {
    current_page: number;
    from: number | null;
    last_page: number;
    links: {
      active: boolean;
      label: string;
      url: string;
    }[];
    path: string;
    per_page: number;
    query: string | null;
    to: number | null;
    total: number;
  };
};

type MonicaSingleResponse<T> = {
  data: T;
};

type MonicaResponse<ArrayOrSingle, DataType> =
  ArrayOrSingle extends MonicaArrayResponse<DataType>
    ? MonicaArrayResponse<DataType>
    : MonicaSingleResponse<DataType>;

const getMonicaParams = async (
  monicaParams?: MonicaParams
): Promise<MonicaParams> => {
  if (typeof monicaParams !== "undefined") {
    return monicaParams;
  }
  const { monicaApiUrl, monicaApiToken } = await getState();
  if (
    typeof monicaApiUrl === "undefined" ||
    typeof monicaApiToken === "undefined"
  ) {
    throw new Error("Missing monica API url or token #nlWiS7");
  }
  return { monicaApiUrl, monicaApiToken };
};

export const sendMonicaRequest = async <ArrayOrSingle, DataType>({
  monicaParams,
  url,
  opts,
}: {
  monicaParams?: MonicaParams;
  url: string;
  opts?: RequestInit;
}): Promise<MonicaResponse<ArrayOrSingle, DataType>> => {
  const { monicaApiUrl, monicaApiToken } = await getMonicaParams(monicaParams);
  const requestUrl = `${trimTrailingSlash(monicaApiUrl)}/${url}`;
  const requestOptions = {
    ...opts,
    headers: {
      ...opts?.headers,
      Authorization: `Bearer ${monicaApiToken}`,
    },
  };
  const response = await fetch(requestUrl, requestOptions);

  // TODO Check the `response.status` code here

  const contentType = response.headers.get("content-type");
  if (contentType !== "application/json") {
    // The request failed
    debugger;
    throw new Error("FATAL: Did not get JSON from monica api #E4Qiy5");
  }

  // const body = await response.json() as ArrayOrSingle<DataType>
  const body = (await response.json()) as MonicaResponse<
    ArrayOrSingle,
    DataType
  >;
  return body;
};

export const sendMonicaPostOrPutRequest = async <ArrayOrSingle, DataType>({
  monicaParams,
  url,
  method,
  body,
}: {
  monicaParams?: MonicaParams;
  url: string;
  method: "post" | "put";
  body: any;
}): Promise<MonicaResponse<ArrayOrSingle, DataType>> => {
  const opts: RequestInit = {
    method,
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  };
  return sendMonicaRequest({ monicaParams, url, opts });
};

export const getFriendFromMonicaByFacebookProfile = async ({
  monicaParams,
  friend,
}: {
  monicaParams?: MonicaParams;
  friend: FacebookFriend;
}): Promise<MonicaFriend | undefined> => {
  const { profileUrl } = friend;
  const url = `contacts?with=contactfields&query=facebook:${profileUrl}`;
  const result = await sendMonicaRequest<
    MonicaArrayResponse<MonicaFriend>,
    MonicaFriend
  >({
    monicaParams,
    url,
  });

  if (result.meta.total === 1) {
    const monicaFriend = result.data[0];
    const { id } = monicaFriend;
    await setFriendMonicaId({ friend, id });
    return monicaFriend;
  }
  if (result.meta.total === 0) {
    return;
  }
  throw new Error("FATAL: Did not get exactly 0 or 1 monica contats #4yh1ea");
};

export const getMonicaFriendById = async ({
  monicaParams,
  id,
}: {
  monicaParams?: MonicaParams;
  id: number;
}) => {
  const url = `contacts/${id.toString()}?with=contactfields`;
  const result = await sendMonicaRequest<
    MonicaSingleResponse<MonicaFriend>,
    MonicaFriend
  >({ monicaParams, url });
  if (typeof result.data !== "undefined") {
    return result.data;
  }
  throw new Error(`FATAL: Could not get monica friend id ${id} #en4CUQ`);
};

const getFacebookContactFieldTypeId = async ({
  monicaParams,
}: {
  monicaParams?: MonicaParams;
}): Promise<number> => {
  const url = "/contactfieldtypes";
  const result = await sendMonicaRequest<
    MonicaArrayResponse<MonicaContactFieldType>,
    MonicaContactFieldType
  >({ monicaParams, url });
  const contactFieldType = result.data.find(
    (field) => field.name.toLowerCase() === "facebook"
  );
  if (typeof contactFieldType === "undefined") {
    // TODO Create the contact field type
    throw new Error(
      "FATAL: Missing facebook contact field type on monica #e05BL4"
    );
  }
  const { id } = contactFieldType;
  return id;
};

export const createFriendOnMonica = async ({
  monicaParams,
  friend,
}: {
  monicaParams?: MonicaParams;
  friend: FacebookFriend;
}) => {
  const { name } = friend;
  const url = `/contacts`;

  const names = name.split(" ");
  const [first_name, ...last_names] = names;
  const last_name = last_names.join(" ");

  const opts: RequestInit = {
    method: "post",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      first_name,
      last_name,
      is_birthdate_known: false,
      is_deceased: false,
      is_deceased_date_known: false,
    }),
  };

  const result = await sendMonicaRequest<
    MonicaSingleResponse<MonicaFriend>,
    MonicaFriend
  >({
    monicaParams,
    url,
    opts,
  });

  const { data: monicaFriend } = result;
  const { id } = monicaFriend;

  await setFriendMonicaId({ friend, id });

  const contact_field_type_id = await getFacebookContactFieldTypeId({
    monicaParams,
  });

  const profileUrl = `/contactfields`;
  const profileBody = {
    contact_id: id,
    data: friend.profileUrl,
    contact_field_type_id,
  };
  await sendMonicaPostOrPutRequest<
    MonicaSingleResponse<MonicaContactField>,
    MonicaContactField
  >({
    monicaParams,
    url: profileUrl,
    body: profileBody,
    method: "post",
  });

  return monicaFriend;
};
