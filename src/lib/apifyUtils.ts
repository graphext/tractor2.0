import { ApifyClient } from "./apifyEndpoints";
import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";

let client: ApifyClient | null = null;

export function initializeApifyClient() {
	const token = get(apifyKey);
	if (token) {
		client = new ApifyClient("61RPP7dywgiy0JPD0"); // Twitter Actor ID
	} else {
		client = null;
	}
}

function ensureClient<T>(operation: (client: ApifyClient) => T): T {
	if (!client) {
		throw new Error(
			"ApifyClient is not initialized. Please set your Apify API key.",
		);
	}
	return operation(client);
}

export async function createTask(
	input: Record<string, unknown>,
) {
	return ensureClient(async (client) => {
		try {
			const task = await client.createTask(input);
			return task;
		} catch (error) {
			console.error("Error creating task:", error);
			throw error;
		}
	});
}

export async function runTask(taskId: string) {
	return ensureClient(async (client) => {
		try {
			const run = await client.runTask(taskId);
			return run;
		} catch (error) {
			console.error("Error running task:", error);
			throw error;
		}
	});
}

export async function getDataset(datasetId: string) {
	return ensureClient(async (client) => {
		try {
			const { items } = await client.getDatasetInfo(datasetId);
			return items;
		} catch (error) {
			console.error("Error retrieving dataset:", error);
			throw error;
		}
	});
}

export async function getRunStatus(runId: string) {
	return ensureClient(async (client) => {
		try {
			const run = await client.getRunStatus(runId);
			return run && run.status;
		} catch (error) {
			console.error("Error getting run status:", error);
			throw error;
		}
	});
}

export async function setupTwitterScrapingTask(queries: string[]) {
	const input = {
		searchTerms: queries,
		maxTweets: 100, // Adjust as needed
		proxyConfiguration: { useApifyProxy: true },
	};

	try {
		const task = await createTask(input);
		const run = await runTask(task.id);
		return run.id;
	} catch (error) {
		console.error("Error setting up Twitter scraping task:", error);
		throw error;
	}
}

apifyKey.subscribe(() => {
	initializeApifyClient();
});
