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

export type GoogleSearchResult = {
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
	url: string;
	hasNextPage: boolean;
	serpProviderCode: string;
	resultsTotal: number;
	relatedQueries: {
		title: string;
		url: string;
	}[];
	paidResults: {
		title: string;
		url: string;
		displayedUrl: string;
		description: string;
		emphasizedKeywords: string[];
		siteLinks: {
			title: string;
			url: string;
			description: string;
		}[];
		type: "paid";
		adPosition: number;
	}[];
	paidProducts: any[]; // Assuming no structured data available
	organicResults: {
		title: string;
		url: string;
		displayedUrl: string;
		description: string;
		emphasizedKeywords: string[];
		siteLinks: any[];
		productInfo: any; // No detailed product info given in the example
		type: "organic";
		position: number;
	}[];
	peopleAlsoAsk: {
		question: string;
		answer: string;
		url: string;
		title: string;
		date: string;
	}[];
	customData: {
		pageTitle: string;
	};
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
	take?: number;
}

export interface TypedJsonToCsvOptions<T> {
	url: string;
	dedupKey?: keyof T | null;
	customColumnOrder?: string[];
	unwind?: {
		[K in ArrayKeys<T>]: TypedUnwindTarget<T, K>;
	}[ArrayKeys<T>][];
}
