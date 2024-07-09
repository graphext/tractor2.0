import { ApifyClient } from "apify-client";
import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";

let client: ApifyClient | null = null;

export function initializeApifyClient() {
	const token = get(apifyKey);
	if (token) {
		client = new ApifyClient({
			token: token,
			// Use browser-compatible configuration
			baseUrl: "https://api.apify.com/v2/",
			maxRetries: 3,
		});
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
	actorId: string,
	input: Record<string, unknown>,
) {
	return ensureClient(async (client) => {
		try {
			const task = await client.tasks().create({
				actId: actorId,
				name: `Twitter Scraping Task ${new Date().toISOString()}`,
				options: {
					build: "latest",
				},
				input,
			});
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
			const run = await client.task(taskId).start();
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
			const { items } = await client.dataset(datasetId).listItems();
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
			const run = await client.run(runId).get();
			return run && run.status;
		} catch (error) {
			console.error("Error getting run status:", error);
			throw error;
		}
	});
}

export async function setupTwitterScrapingTask(queries: string[]) {
	const actorId = "quacker/twitter-scraper"; // Replace with the actual Apify actor ID for Twitter scraping
	const input = {
		searchTerms: queries,
		maxTweets: 100, // Adjust as needed
		proxyConfiguration: { useApifyProxy: true },
	};

	try {
		const task = await createTask(actorId, input);
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
