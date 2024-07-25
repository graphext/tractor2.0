import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";
import { cleanQueries, cleanText } from "./utils";

const BASE_URL = "https://api.apify.com/v2";

async function apifyFetch(
	endpoint: string,
	options: RequestInit = {},
	stream = false,
) {
	const token = get(apifyKey);
	if (!token) {
		throw new Error("Apify API token is not set");
	}

	const url = `${BASE_URL}${endpoint}`;
	const headers = {
		Authorization: `Bearer ${token}`,
		"Content-Type": "application/json",
		...options.headers,
	};

	console.log("URL:", url);
	console.log("Headers:", headers);
	console.log("Options:", options);

	const response = await fetch(url, { ...options, headers });

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Apify API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	if (stream) {
		return response;
	} else {
		return response.json();
	}
}

export async function createTask(
	actorId: string,
	input: Record<string, unknown>,
) {
	const token = get(apifyKey);
	const tokenEnd = token.slice(-4);

	const endpoint = "/actor-tasks";
	const body = JSON.stringify({
		actId: actorId,
		name: `TRCTR-${tokenEnd}-${Math.floor(Math.random() * 10000)
			.toString()
			.padStart(5, "0")}`,
		options: {
			build: "latest",
		},
		input,
	});

	console.log("Request Body:", body);

	return apifyFetch(endpoint, { method: "POST", body });
}

export async function runTask(taskId: string) {
	const endpoint = `/actor-tasks/${taskId}/runs`;
	return apifyFetch(endpoint, { method: "POST" });
}

export async function getRunStatus(runId: string) {
	const endpoint = `/actor-runs/${runId}`;
	const data = await apifyFetch(endpoint);
	return data;
}

export async function getLogsForRun(runId: string) {
	const endpoint = `/logs/${runId}?stream=true`;
	const data = await apifyFetch(endpoint, {}, true);

	const reader = data.body.getReader();
	return reader;
}

export async function getDatsetInfo(runId: string) {
	const runStatus = await getRunStatus(runId);

	const datasetId = runStatus.data.defaultDatasetId;

	let endpoint = `/datasets/${datasetId}`;
	const data = await apifyFetch(endpoint);
	return data;
}

export async function getDatsetLength(runId: string) {
	// https://api.apify.com/v2/datasets/YvjRu9xN1a62TS27A/items?token=***
	const runStatus = await getRunStatus(runId);

	const datasetId = runStatus.data.defaultDatasetId;

	let endpoint = `/datasets/${datasetId}/items`;
	const data = await apifyFetch(endpoint);

	return data.length;
}

export async function getDatasetLink(
	runId: string,
	format: "csv" | "json" = "json",
) {
	const token = get(apifyKey);
	if (!token) {
		throw new Error("Apify API token is not set");
	}

	let endpoint = `/actor-runs/${runId}/dataset/items?token=${token}&format=${format}&attachment=true&clean=true`;

	// const data = await apifyFetch(endpoint);
	return `${BASE_URL}${endpoint}`;
}

export async function getPrivateUserData() {
	let endpoint = `/users/me`;

	const data = await apifyFetch(endpoint);
	return data;
}

const typeMap = {
	createdAt: "date",
	authorName: "category",
	text: "text",
	url: "url",
	viewCount: "number",
	retweetCount: "number",
	replyCount: "number",
	likeCount: "number",
	quoteCount: "number",
	lang: "category",
	bookmarkCount: "number",
	source: "category",
	isReply: "boolean",
	isRetweet: "boolean",
	isQuote: "boolean",
	media: "list[url]",
};

const authorMap = {
	authorUserName: "category",
	authorUrl: "url",
	authorFollowers: "number",
	authorCreatedAt: "date",
	authorIsVerified: "boolean",
	authorProfilePicture: "category",
	authorCoverPicture: "category",
	authorDescription: "text",
	authorLocation: "category",
};

function createFunctionString() {
	return `(object) => { const { author, ${Object.keys(typeMap).join(", ")} } = object; return { ${Object.keys(
		typeMap,
	)
		.map((e) => '"' + e + "<gx:" + typeMap[e] + ">" + '": ' + e)
		.join(
			", ",
		)}, ${Object.keys(authorMap).map((e) => '"' + e + "<gx:" + authorMap[e] + ">" + '": ' + "author." + e.slice(6).charAt(0).toLowerCase() + e.slice(7))} }; }`;
}

export async function setupTwitterScrapingTask(
	queries: string[],
	numTweets: number,
	maxTweetsPerQuery: number,
) {
	const actorId = "61RPP7dywgiy0JPD0"; // Replace with the actual Apify actor ID for Twitter scraping

	const input = {
		customMapFunction: createFunctionString(),
		maxItems: numTweets,
		maxTweetsPerQuery: maxTweetsPerQuery,
		includeSearchTerms: false,
		onlyImage: false,
		onlyQuote: false,
		onlyTwitterBlue: false,
		onlyVerifiedUsers: false,
		onlyVideo: false,
		sort: "Latest",
		searchTerms: queries,
	};

	try {
		const task = await createTask(actorId, input);
		const run = await runTask(task.data.id);
		return run.data.id;
	} catch (error) {
		console.error("Error setting up scraping:", error);
		throw error;
	}
}
