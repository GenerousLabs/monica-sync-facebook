export type FacebookFriend = {
  profileUrl: string;
  name: string;
  tableData?: {
    updatedAtMs: number;
    data: { label: string; value: string }[];
  };
  monicaId?: number;
  /** This contact should be force synced to monica even there is no matching
   * contact already in monica */
  forceSyncToMonica?: boolean;
};

type MonicaAccount = {
  id: number;
};
export type MonicaContactFieldType = {
  account: MonicaAccount;
  created_at: string;
  delible: boolean;
  fontawesome_icon: string;
  id: number;
  name: string;
  object: "contactfieldtype";
  protocol: string;
  type: string | null;
  updated_at: string;
};
export type MonicaContactField = {
  account: MonicaAccount;
  contact: {};
  contact_field_type: MonicaContactFieldType;
  // TODO Is this content or data? Docs say data but I saw content from the API
  content: string;
  data: string;
  created_at: string;
  id: number;
  labels: [];
  object: string;
  updated_at: string;
};
export type MonicaAddress = {
  id: number;
  object: "address";
  name: string | null;
  street: string | null;
  city: string | null;
  province: string | null;
  postal_code: string | null;
  country: {
    id: string;
    object: "country";
    name: string;
    iso: string;
  } | null;
  account: MonicaAccount;
};
export type MonicaPhoto = {
  id: number;
  object: "photo";
  original_filename: string;
  new_filename: string;
  filesize: number;
  mime_type: string;
  link: string;
  account: MonicaAccount;
  contact: {};
  created_at: string;
  updated_at: string;
};
export type MonicaNote = {
  id: string;
  object: "note";
  body: string;
  is_favorited: boolean;
  favorited_at: string | null;
  account: MonicaAccount;
  contact: {};
  created_at: string;
  updated_at: string;
};
export type MonicaFriend = {
  account: {
    id: number;
  };
  addresses: MonicaAddress[];
  complete_name: string;
  contact_fields: MonicaContactField[] | null;
  created_at: string;
  description: string | null;
  first_name: string;
  gender: string | null;
  gender_type: string | null;
  hash_id: string;
  id: number;
  information: {}; // TODO
  initials: string;
  is_active: boolean;
  is_dead: boolean;
  is_me: boolean;
  is_partial: boolean;
  is_starred: boolean;
  last_activity_together: string | null;
  last_called: string | null;
  nickname: string | null;
  notes: MonicaNote[];
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
  rateLimitingDelaySeconds: number;
};

export type RuntimeMessage = {
  type: "pushToMonica";
};
