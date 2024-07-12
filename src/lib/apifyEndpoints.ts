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
		const errorText = await response.text(); // Get the error message from response
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
	const endpoint = "/actor-tasks"; // Ensure this is the correct endpoint
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

export async function setupTwitterScrapingTask(
	queries: string[],
	numTweets: number,
	maxTweetsPerQuery: number,
) {
	const actorId = "61RPP7dywgiy0JPD0"; // Replace with the actual Apify actor ID for Twitter scraping

	const input = {
		customMapFunction: "(object) => { return {...object} }",
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
