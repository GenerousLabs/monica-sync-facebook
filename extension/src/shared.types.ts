export type FacebookFriend = {
  profileUrl: string;
  name: string;
};

export type State = {
  /** The API url of the user's monica instance */
  monicaApiUrl?: string;
  /** The API token to authenticate with the user's monica instance */
  monicaApiToken?: string;
  /** The URL to the user's own Facebook friends list */
  facebookFriendsUrl?: string;
  /** Facebook friends to scrape for additional data */
  facebookFriendsToScrape: FacebookFriend[];
};

export type RuntimeMessage = {
  type: "pushToMonica";
};
