import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";
import { dev } from "$app/environment";

export const ACT_ID = "61RPP7dywgiy0JPD0";
export const DEDUP_ACTOR_ID = "ou2buPCN9hYdGLVdT";

const MERGE_DEDUP_URL =
	"https://api.apify.com/v2/acts/ou2buPCN9hYdGLVdT/runs?build=latest&timeout=0&memory=8192";

const BASE_URL = "https://api.apify.com/v2";

async function apifyFetch(endpoint: string, options: RequestInit = {}) {
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

	if (dev) {
		console.log("URL:", url);
		console.log("Headers:", headers);
		console.log("Options:", options);
	}

	const response = await fetch(url, { ...options, headers });

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			`Apify API error: ${response.status} ${response.statusText} - ${errorText}`,
		);
	}

	return response.json();
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

	if (dev) console.log("Request Body:", body);

	return apifyFetch(endpoint, { method: "POST", body });
}

export async function getRuns() {
	const endpoint = "/actor-runs";
	const data = await apifyFetch(endpoint);
	return data;
}

export async function getRunsForTask(taskId: string) {
	const endpoint = `/actor-tasks/${taskId}/runs`;
	const data = await apifyFetch(endpoint);
	return data;
}

export async function getTasks() {
	const endpoint = "/actor-tasks?limit=30&desc=true";
	const data = await apifyFetch(endpoint);
	return data;
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
	format: "csv" | "json" = "csv",
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
	authorName: "category",
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

export function createFunctionString() {
	return `(object) => { const { author, ${Object.keys(typeMap).join(", ")} } = object; return { ${Object.keys(
		typeMap,
	)
		.map((e) => '"' + e + "<gx:" + typeMap[e] + ">" + '": ' + e)
		.join(
			", ",
		)}, ${Object.keys(authorMap).map((e) => '"' + e + "<gx:" + authorMap[e] + ">" + '": ' + "author." + e.slice(6).charAt(0).toLowerCase() + e.slice(7))} }; }`;
}

export async function createDataset(name: string) {
	const endpoint = `/datasets?name=${name}`;
	return await apifyFetch(endpoint, { method: "POST" });
}

export async function createWebhook(requestBody) {
	const endpoint = `/webhooks`;
	return await apifyFetch(endpoint, {
		method: "POST",
		body: JSON.stringify(requestBody),
	});
}

export async function invokeSchedule(scheduleId: string) {
	const endpoint = `/schedules/${scheduleId}/invoke`;
	console.log("invoking schedule immediately");
	return await apifyFetch(endpoint, { method: "POST" });
}

export async function scheduleTask({
	taskId,
	scheduleKW,
	datasetId,
	cronExpression,
	description,
}: {
	taskId: string;
	scheduleKW: string;
	datasetId: string;
	cronExpression: string;
	description: string | undefined;
}) {
	const schedulesEndpoint = "/schedules";
	const userId = (await getPrivateUserData()).data.id;

	const token = get(apifyKey);
	const body = JSON.stringify({
		name: `TRCTR-${scheduleKW}-${token.slice(-4)}-${Math.floor(
			Math.random() * 10000,
		)
			.toString()
			.padStart(5, "0")}`,
		userId: userId,
		isEnabled: true,
		isExclusive: true,
		cronExpression: cronExpression,
		timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
		description: description,
		actions: [
			{
				type: "RUN_ACTOR_TASK",
				actorTaskId: taskId,
				actorId: ACT_ID,
			},
		],
	});

	const webhookPayload = {
		outputDatasetId: datasetId,
		datasetIds: ["{{resource.defaultDatasetId}}", datasetId],
		mode: "dedup-as-loading", // for low memory usage, safer
		output: "unique-items",
		fields: ["url<gx:url>"],
	};

	const webookConfig: Record<string, unknown> = {
		requestUrl: MERGE_DEDUP_URL,
		eventTypes: ["ACTOR.RUN.SUCCEEDED"],
		condition: {
			actorTaskId: taskId,
		},
		shouldInterpolateStrings: true,
		isApifyIntegration: true,
		payloadTemplate: JSON.stringify(webhookPayload),
	};

	try {
		const scheduleData = await apifyFetch(schedulesEndpoint, {
			method: "POST",
			body,
		});

		const webhookData = await createWebhook(webookConfig);

		//run schedule immediately
		invokeSchedule(scheduleData.data.id);

		return { scheduleData: scheduleData, webhookData: webhookData };
	} catch (e) {
		console.error("Couldn't setup schedule", e);
		throw e;
	}
}

export async function setupTwitterScrapingTask(
	queries: string[],
	numTweets: number,
	maxTweetsPerQuery: number,
) {
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
		const task = await createTask(ACT_ID, input);
		const run = await runTask(task.data.id);
		return run.data.id;
	} catch (error) {
		console.error("Error setting up scraping:", error);
		throw error;
	}
}
