import { addLogLine } from "./shared.log";
import { FacebookFriend, State } from "./shared.types";

const STATE_KEY = "__state";

const empty: State = {
  facebookFriendsToScrape: [],
  rateLimitingDelaySeconds: 0,
};

export const getState = async (): Promise<State> => {
  const result = await browser.storage.local.get(STATE_KEY);
  const state = result[STATE_KEY] as State;
  if (typeof state === "undefined") {
    return empty;
  }
  return { ...empty, ...state };
};

export const getMonicaParams = async () => {
  const { monicaApiUrl, monicaApiToken } = await getState();

  if (
    typeof monicaApiUrl === "undefined" ||
    typeof monicaApiToken === "undefined"
  ) {
    throw new Error("FATAL: Monica params not set #vXYPcZ");
  }

  return { monicaApiUrl, monicaApiToken };
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
  const newState = { ...state, monicaApiToken, monicaApiUrl } as State;
  await setState(newState);
};

export const setFacebookFriendsUrl = async ({
  facebookFriendsUrl,
}: {
  facebookFriendsUrl: string;
}) => {
  const state = await getState();
  const newState = { ...state, facebookFriendsUrl } as State;
  await setState(newState);
};

export const setFacebookFriendsToScrape = async (
  facebookFriendsToScrape: FacebookFriend[]
) => {
  const state = await getState();
  const newState = { ...state, facebookFriendsToScrape } as State;
  await setState(newState);
};

export const setRateLimitDelay = async (rateLimitingDelaySeconds: number) => {
  const state = await getState();
  const newState = { ...state, rateLimitingDelaySeconds } as State;
  await setState(newState);
  await addLogLine(
    `Setting rateLimitingDelaySeconds to ${rateLimitingDelaySeconds} seconds. #oPFn1K`
  );
};
