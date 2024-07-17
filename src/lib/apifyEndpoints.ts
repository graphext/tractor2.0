import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";

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
	const endpoint = "/actor-tasks";
	const body = JSON.stringify({
		actId: actorId,
		name: `Tractor-Run-${Math.floor(Math.random() * 1000)}`,
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

//     "userName": "victorianoi",
//     "url": "https://x.com/victorianoi",
//     "twitterUrl": "https://twitter.com/victorianoi",
//     "id": "10977452",
//     "name": "Victoriano Izquierdo",
//     "isVerified": true,
//     "profilePicture": "https://pbs.twimg.com/profile_images/1739668248868605952/HtcGO3HA_normal.jpg",
//     "coverPicture": "https://pbs.twimg.com/profile_banners/10977452/1531062649",
//     "description": "Co-founder @graphext . Data Science, Product, Business \n🧠 https://t.co/N4c77ih17x 📷 https://t.co/SH0SjWlDbr",
//     "location": "From Granada, in Madrid, Spain",
//     "followers": 28146,
//     "following": 998,
//     "status": "",
//     "canDm": true,
//     "canMediaTag": true,
//     "createdAt": "Sat Dec 08 19:36:45 +0000 2007",

// function unwindAuthor(object) {
// 	const { author } = object;
// 	return {
// 		...object,
// 		authorUserName: author.userName,
// 		authorUrl: author.url,
// 		authorName: author.name,
// 		authorIsVerified: author.isVerified,
// 		authorProfilePicture: author.profilePicture,
// 		authorCoverPicture: author.coverPicture,
// 		authorDescription: author.description,
// 		authorLocation: author.location,
// 		authorFollowers: author.followers,
// 		authorCreatedAt: author.createdAt,
// 	};
// }

export async function setupTwitterScrapingTask(
	queries: string[],
	numTweets: number,
	maxTweetsPerQuery: number,
) {
	const actorId = "61RPP7dywgiy0JPD0"; // Replace with the actual Apify actor ID for Twitter scraping

	const input = {
		customMapFunction: `(object) => { const { author } = object; return { ...object, "authorUserName": author.userName, authorUrl: author.url, authorName: author.name, authorIsVerified: author.isVerified, authorProfilePicture: author.profilePicture, authorCoverPicture: author.coverPicture, authorDescription: author.description, authorLocation: author.location, authorFollowers: author.followers, authorCreatedAt: author.createdAt, } }`,
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
