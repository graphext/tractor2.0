export type Frequency = "Daily" | "Weekly" | "Monthly" | "Anually";

export type Status =
  | "READY"
  | "RUNNING"
  | "SUCCEEDED"
  | "FAILED"
  | "ABORTED"
  | "ABORTING"
  | "TIMING-OUT"
  | "TIMED-OUT";

export type Run = {
  id: string;
  actId: string;
  actorTaskId: string;
  status: Status;
  startedAt: string;
  finishedAt: string;
  buildId: string;
  buildNumber: string;

  usageTotalUsd: number;
  defaultKeyValueStoreId: string;
  defaultDatasetId: string;
  defaultRequestQueueId: string;
};

export type Task = {
  id: string;
  userId: string;
  actId: string;
  actName: string;
  name: string;
  username: string;
  actUsername: string;
  createdAt: string;
  modifiedAt: string;
  stats: {
    totalRuns: number;
  };
};

export type InstagramPost = {
  inputUrl: string;
  timestamp: string;
  type: string;
  likesCount: number;
  commentsCount: number;
  caption: string;
  id: string;
  username: string;
  url: string;
  fullName: string;
  biography: string;
  externalUrl: string;
  externalUrlShimmed: string;
  followersCount: number;
  followsCount: number;
  hasChannel: boolean;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  joinedRecently: boolean;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  igtvVideoCount: number;
  relatedProfiles: string[];
  taggedUsers: {
    full_name: string;
    id: string;
    is_verified: boolean;
    profile_pic_url: string;
    username: string;
  }[];
  coauthorProducers: {
    id: string;
    is_verified: boolean;
    profile_pic_url: string;
    username: string;
  }[];
  latestIgtvVideos: {
    type: string;
    shortCode: string;
    title: string;
    caption: string;
    commentsCount: number;
    commentsDisabled: boolean;
    dimensionsHeight: number;
    dimensionsWidth: number;
    displayUrl: string;
    likesCount: number;
    videoDuration: number;
    videoViewCount: number;
    id: string;
    hashtags: string[];
    mentions: string[];
    url: string;
    firstComment: string;
    latestComments: string[];
    images: string[];
    videoUrl: string;
    alt: string | null;
    timestamp: string;
    childPosts: string[];
    locationName: string;
    locationId: string;
    ownerUsername: string;
    ownerId: string;
    productType: string;
    taggedUsers: {
      full_name: string;
      id: string;
      is_verified: boolean;
      profile_pic_url: string;
      username: string;
    }[];
  }[];
};

export type InstagramComment = {
  id: string;
  postId: string;
  text: string;
  position: number;
  timestamp: string; // ISO Date string
  ownerId: string;
  ownerIsVerified: boolean;
  ownerUsername: string;
  ownerProfilePicUrl: string;
};

export type InstagramProfile = {
  id: string;
  username: string;
  fullName: string;
  biography: string;
  externalUrl: string;
  externalUrlShimmed: string;
  followersCount: number;
  followsCount: number;
  hasChannel: boolean;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  joinedRecently: boolean;
  businessCategoryName: string | null;
  private: boolean;
  verified: boolean;
  profilePicUrl: string;
  profilePicUrlHD: string;
  facebookPage: string | null;
  igtvVideoCount: number;
  latestIgtvVideos: {
    type: string;
    shortCode: string;
    title: string;
    caption: string;
    commentsCount: number;
    commentsDisabled: boolean;
    dimensionsHeight: number;
    dimensionsWidth: number;
    displayUrl: string;
    likesCount: number;
    videoDuration?: number;
    videoViewCount?: number;
  }[];
  postsCount: number;
  latestPosts: {
    type: string;
    shortCode: string;
    caption: string;
    commentsCount: number;
    dimensionsHeight: number;
    dimensionsWidth: number;
    displayUrl: string;
    likesCount: number;
    videoViewCount?: number;
    timestamp: string; // ISO Date string
    locationName: string | null;
  }[];
  following: string[];
  followedBy: string[];
};

export type InstagramHashtag = {
  id: string;
  name: string;
  topPostsOnly: boolean;
  profilePicUrl: string;
  postsCount: number;
  topPosts: {
    type: "Image" | "Video" | "Sidecar";
    shortCode: string;
    caption: string;
    hashtags: string[];
    mentions: string[];
    commentsCount: number;
    dimensionsHeight: number;
    dimensionsWidth: number;
    displayUrl: string;
    likesCount: number;
    timestamp: string; // ISO Date string
    locationName: string | null;
  }[];
  latestPosts: {
    type: "Image" | "Video" | "Sidecar";
    shortCode: string;
    caption: string;
    commentsCount: number;
    dimensionsHeight: number;
    dimensionsWidth: number;
    displayUrl: string;
    likesCount: number;
    timestamp: string; // ISO Date string
    locationName: string | null;
  }[];
};

type SiteLink = {
  title: string;
  url: string;
  description: string;
};

type SearchQuery = {
  term: string;
  url: string;
  device: "DESKTOP" | "MOBILE"; // Specify if other devices might be present
  page: number;
  type: "SEARCH"; // Specify if other types might be present
  domain: string;
  countryCode: string;
  languageCode: string | null;
  locationUule: string | null;
  resultsPerPage: string;
};

type RelatedQuery = {
  title: string;
  url: string;
};

type PeopleAlsoAsk = {
  question: string;
  answer: string;
  url: string;
  title: string;
  date: string;
};

type OrganicResult = {
  title: string;
  url: string;
  displayedUrl: string;
  description: string;
  date: string; // Consider using Date type if you need to manipulate it as a date
  emphasizedKeywords: string[];
  siteLinks: SiteLink[]; // Assuming site links are represented as strings
  productInfo: Record<string, unknown>; // Replace with a more specific type if known
  type: "organic"; // Specify if other types might be present
  position: number;
};

type PaidResult = {
  title: string;
  url: string;
  displayedUrl: string;
  description: string;
  emphasizedKeywords: string[];
  siteLinks: SiteLink[];
  type: "paid"; // Specify if other types might be present
  adPosition: number;
};

export type SearchGoogleResult = {
  searchQuery: SearchQuery;
  resultsTotal: number;
  relatedQueries: RelatedQuery[];
  paidResults: PaidResult[]; // Specify the type if known
  paidProducts: any[]; // Specify the type if known
  organicResults: OrganicResult[]; // Specify the type if known
  peopleAlsoAsk: PeopleAlsoAsk[];
  customData: {
    pageTitle: string;
  };
};

export type OrganicGoogleResult = {
  searchQuery: {
    term: string;
    url: string;
    device: string;
    page: number;
    type: string;
    domain: string;
    countryCode: string;
    languageCode: string | null;
    locationUule: string | null;
    resultsPerPage: string;
  };
  resultsTotal: number;
  title: string;
  url: string;
  displayedUrl: string;
  description: string;
  emphasizedKeywords: string[];
  siteLinks: string[];
  productInfo: Record<string, unknown>;
  type: string;
  position: number;
};

export type LinkedInResult = {
  urn: string;
  text: string;
  url: string;
  postedAtTimestamp: number;
  postedAtISO: string;
  timeSincePosted: string;
  numLikes: number;
  numShares: number;
  numComments: number;
  isRepost: boolean;
  authorType: string;
  authorProfileUrl: string;
  authorProfileId: string;
  authorHeadline: string;
  authorFullName: string;
  image: string;
  type: string;
  images: string[];
  author: {
    firstName: string;
    lastName: string;
    occupation: string;
    id: string;
    publicId: string;
    trackingId: string;
    profileId: string;
    picture?: string;
    backgroundImage?: string;
  };
  authorName: string;
  authorTitle: string;
  attributes: {
    start: number;
    length: number;
    type: string;
    profile: {
      firstName: string;
      lastName: string;
      occupation: string;
      id: string;
      publicId: string;
      trackingId: string;
      profileId: string;
      picture?: string;
      backgroundImage?: string;
    };
  }[];
  comments: {
    time: number;
    link: string;
    text: string;
    entities: any[];
    pinned: boolean;
    originalLanguage: string;
    author: {
      firstName: string;
      lastName: string;
      occupation: string;
      id: string;
      publicId: string;
      trackingId: string;
      profileId: string;
      picture?: string;
      backgroundImage?: string;
      distance: string;
    };
  }[];
  reactions: {
    type: string;
    profile: {
      firstName: string;
      lastName: string;
      occupation: string;
      id: string;
      publicId: string;
      trackingId: string;
      profileId: string;
      picture?: string;
      backgroundImage?: string;
    };
  }[];
};

export type TikTokPost = {
  id: string;
  text: string;
  createTime: number;
  createTimeISO: string;
  authorMeta: {
    id: string;
    name: string;
    profileUrl: string;
    nickName: string;
    verified: boolean;
    signature: string;
    bioLink: string | null;
    avatar: string;
    commerceUserInfo: {
      commerceUser: boolean;
    };
    privateAccount: boolean;
    region: string;
    roomId: string;
    ttSeller: boolean;
    following: number;
    friends: number;
    fans: number;
    heart: number;
    video: number;
    digg: number;
  };
  musicMeta: {
    musicName: string;
    musicAuthor: string;
    musicOriginal: boolean;
    playUrl: string;
    coverMediumUrl: string;
    musicId: string;
    musicAlbum?: string; // Optional field, since not all examples have it
  };
  webVideoUrl: string;
  mediaUrls: string[];
  videoMeta: {
    height: number;
    width: number;
    duration: number;
    coverUrl: string;
    originalCoverUrl: string;
    definition: string;
    format: string;
  };
  diggCount: number;
  shareCount: number;
  playCount: number;
  collectCount: number;
  commentCount: number;
  mentions: string[];
  hashtags: {
    name: string;
  }[];
  effectStickers: string[];
  isSlideshow: boolean;
  isPinned: boolean;
  isSponsored: boolean;
  input: string;
};

interface Meta {
  origin: string;
}

interface Item {
  id: string;
  actId: string;
  actorTaskId?: string;
  status: string;
  startedAt: string;
  finishedAt: string;
  buildId: string;
  buildNumber: string;
  meta: Meta;
  defaultKeyValueStoreId: string;
  defaultDatasetId: string;
  defaultRequestQueueId: string;
  usageTotalUsd: number;
}

export interface RunData {
  total: number;
  count: number;
  offset: number;
  limit: number;
  desc: boolean;
  items: Item[];
}

export interface RunResponse {
  data: RunData;
}

interface Stats {
  totalRuns: number;
  lastRunStartedAt?: string;
}

export interface ActorItem {
  id: string;
  createdAt: string;
  modifiedAt: string;
  name: string;
  username: string;
  title: string;
  stats: Stats;
}

export interface ActorData {
  total: number;
  count: number;
  offset: number;
  limit: number;
  desc: boolean;
  items: ActorItem[];
}

export interface ActorResponse {
  data: ActorData;
}

// typescript masturbation to make LSP work with types from apify

type ArrayElement<T> = T extends Array<infer E> ? E : never;

type ArrayKeys<T> = {
  [K in keyof T]: T[K] extends Array<any> ? K : never;
}[keyof T];

type ObjectKeysInArray<T> = keyof T & string;

interface TypedUnwindField<T> {
  field: ObjectKeysInArray<T>;
  alias?: string;
}

export interface TypedUnwindTarget<T, K extends ArrayKeys<T>> {
  targetCol: K;
  fields: TypedUnwindField<ArrayElement<T[K]>>[]; // Directly pass the object type from the array
  take?: number | "max";
}

export interface TypedJsonToCsvOptions<T> {
  url: string;
  dedupKey?: keyof T | null;
  customColumnOrder?: (keyof T)[];
  removeColumns?: (keyof T)[];
  unwind?: {
    [K in ArrayKeys<T>]: TypedUnwindTarget<T, K>;
  }[ArrayKeys<T>][];
  pivot?: { column: string; pivot: string[] } | null;
}




// twitter types

interface UserEntitiesDescriptionUrls {
  display_url?: string;
  expanded_url?: string;
  indices?: [number, number];
  url?: string;
}

interface UserEntitiesDescription {
  urls: UserEntitiesDescriptionUrls[];
}

interface UserEntitiesUrl {
  urls?: any[]; // Example data shows empty object, but could potentially have urls
}

interface UserEntities {
  description: UserEntitiesDescription;
  url: UserEntitiesUrl;
}

interface ProfileBioEntitiesDescription { }

interface ProfileBioEntities {
  description: ProfileBioEntitiesDescription;
  url?: ProfileBioEntitiesDescription; // Added as url can exist in profile_bio.entities based on example
}

interface ProfileBio {
  description: string;
  entities: ProfileBioEntities;
}

interface Author {
  type: "user";
  userName: string;
  url: string;
  twitterUrl: string;
  id: string;
  name: string;
  isVerified: boolean;
  isBlueVerified: boolean;
  profilePicture: string;
  coverPicture: string;
  description: string;
  location: string;
  followers: number;
  following: number;
  status: string;
  canDm: boolean;
  canMediaTag: boolean;
  createdAt: string;
  entities: UserEntities;
  fastFollowersCount: number;
  favouritesCount: number;
  hasCustomTimelines: boolean;
  isTranslator: boolean;
  mediaCount: number;
  statusesCount: number;
  withheldInCountries: any[]; // Assuming empty array is represented as any[]
  affiliatesHighlightedLabel: {};
  possiblySensitive: boolean;
  pinnedTweetIds: string[];
  profile_bio: ProfileBio;
  isAutomated: boolean;
  automatedBy: null | any; // Assuming null or potentially other types
}

interface UserMention {
  id_str: string;
  indices: [number, number];
  name: string;
  screen_name: string;
}

interface Hashtag {
  indices: [number, number];
  text: string;
}

interface Symbol {
  indices: [number, number];
  text: string;
}

interface TweetEntities {
  user_mentions?: UserMention[];
  hashtags?: Hashtag[];
  symbols?: Symbol[];
}

interface ReplyToUserCore {
  screen_name: string;
}

interface ReplyToUserResult {
  __typename: "User";
  rest_id: string;
  core: ReplyToUserCore;
}

interface ReplyToUserResults {
  rest_id: string;
  result: ReplyToUserResult;
}

interface MediaSize {
  w: number;
  h: number;
  resize: string;
}

interface MediaFaces {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MediaOriginalInfo {
  width: number;
  height: number;
  focus_rects?: MediaFocusRect[];
}

interface MediaFocusRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface MediaColorROkPaletteRgb {
  red: number;
  green: number;
  blue: number;
}

interface MediaColorROkPalette {
  rgb: MediaColorROkPaletteRgb;
  percentage: number;
}

interface MediaColorROk {
  palette: MediaColorROkPalette[];
}

interface MediaColorR {
  ok: MediaColorROk;
}

interface MediaColor {
  r: MediaColorR;
  ttl: number;
}

interface MediaExt {
  mediaColor: MediaColor;
}

interface MediaResultsResult {
  __typename: "ApiMedia";
  id: string;
  media_key: string;
}

interface MediaResults {
  id: string;
  result: MediaResultsResult;
}

interface MediaType {
  display_url?: string;
  expanded_url?: string;
  ext_media_availability?: { status: string };
  features?: MediaFeatures;
  id_str: string;
  indices?: [number, number];
  media_key: string;
  media_results?: MediaResults;
  media_url_https: string;
  original_info: MediaOriginalInfo;
  sizes?: {
    medium: MediaSize;
    small: MediaSize;
    thumb: MediaSize;
    large: MediaSize;
  };
  type: string;
  url?: string;
  source_user_id?: string;
  source_user_id_str?: string;
  media_url?: string;
  ext?: MediaExt;
}

interface MediaFeatures {
  large?: { faces?: MediaFaces[] };
  orig?: { faces?: MediaFaces[] };
}


interface ExtendedEntities {
  media?: MediaType[];
}

interface CardBindingValueValue {
  string_value?: string;
  scribe_key?: string;
}

interface CardBindingValue {
  key: string;
  value: CardBindingValueValue;
}

interface CardPlatformPlatformDevice {
  name: string;
  version: string;
}

interface CardPlatformPlatformAudience {
  name: string;
}

interface CardPlatformPlatform {
  audience: CardPlatformPlatformAudience;
  device: CardPlatformPlatformDevice;
}

interface CardPlatform {
  platform: CardPlatformPlatform;
}

interface Card {
  binding_values: CardBindingValue[];
  card_platform: CardPlatform;
  name: string;
  url: string;
}


export type TweetType = {
  type: "tweet";
  id: string;
  url: string;
  twitterUrl: string;
  text: string;
  source: string;
  retweetCount: number;
  replyCount: number;
  likeCount: number;
  quoteCount: number;
  viewCount: number;
  createdAt: string;
  lang: string;
  bookmarkCount: number;
  isReply: boolean;
  inReplyToId: string | null;
  conversationId: string;
  inReplyToUserId: string | null;
  inReplyToUsername: string | null;
  isPinned: boolean;
  author: Author;
  extendedEntities: ExtendedEntities;
  card: Card | null;
  place: {}; // Assuming empty object for place
  entities: TweetEntities;
  reply_to_user_results: ReplyToUserResults | null;
  quoted_tweet_results: null;
  quoted_tweet: null;
  retweeted_tweet: null;
  isConversationControlled: boolean;
  searchTermIndex: number;
}
