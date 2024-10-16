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
	}
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
	fields: TypedUnwindField<ArrayElement<T[K]>>[];  // Directly pass the object type from the array
	take?: number | "max";
}

export interface TypedJsonToCsvOptions<T> {
	url: string;
	dedupKey?: keyof T | null;
	customColumnOrder?: (keyof T)[];
	unwind?: {
		[K in ArrayKeys<T>]: TypedUnwindTarget<T, K>;
	}[ArrayKeys<T>][];
}
