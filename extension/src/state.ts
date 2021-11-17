import { State } from "./shared.types";

const STATE_KEY = "__state";

const empty: State = {};

export const getState = async (): Promise<State> => {
  const result = await browser.storage.local.get(STATE_KEY);
  const state = result[STATE_KEY] as State;
  if (typeof state === "undefined") {
    return empty;
  }
  return state;
};

const setState = async (state: State) => {
  const set = {
    [STATE_KEY]: state,
  };
  await browser.storage.local.set(set);
};

export const setMonicaUrlAndToken = async ({
  monicaApiUrl,
  monicaApiToken,
}: {
  monicaApiUrl: string;
  monicaApiToken: string;
}) => {
  const state = await getState();
  const newState = { ...state, monicaApiToken, monicaApiUrl };
  await setState(newState);
};

export const setFacebookFriendsUrl = async ({
  facebookFriendsUrl,
}: {
  facebookFriendsUrl: string;
}) => {
  const state = await getState();
  const newState = { ...state, facebookFriendsUrl };
  await setState(newState);
};
