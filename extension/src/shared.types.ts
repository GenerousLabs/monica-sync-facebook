export type FacebookFriend = {
  profileUrl: string;
  name: string;
  tableData?: {
    updatedAtMs: number;
    data: { label: string; value: string }[];
  };
  monicaId?: number;
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
export type MonicaFriend = {
  account: {
    id: number;
  };
  addresses: MonicaAddress[];
  complete_name: string;
  contact_fields: MonicaContactField[];
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
  notes: []; // TODO
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
