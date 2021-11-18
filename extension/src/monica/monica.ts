import { getFriends } from "../facebook/friends";
import { FacebookFriend, State } from "../shared.types";
import { getMonicaParams } from "../state";

type MonicaParams = Required<Pick<State, "monicaApiUrl" | "monicaApiToken">>;

const getFriendFromMonica = async ({
  monicaParams,
  friend,
}: {
  monicaParams: MonicaParams;
  friend: FacebookFriend;
}) => {
  // Try the monica API
  return {};
};

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

export const pushToMonica = async () => {
  const monicaParams = await getMonicaParams();
  const friends = await getFriends();

  for (const friend of friends) {
    const monicaFriend = await getFriendFromMonica({ monicaParams, friend });
    if (typeof monicaFriend === "undefined") {
      await monicaPostFriend({ monicaParams, friend });
    } else {
      await monicaPutFriend({ monicaParams, friend, monicaFriend });
    }
  }
};
