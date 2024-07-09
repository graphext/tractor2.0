import { ApifyClient } from "apify-client";
import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";

let client: ApifyClient | null = null;

// Function to initialize or update the ApifyClient with a token
export function initializeApifyClient() {
	const token = get(apifyKey);
	if (token) {
		client = new ApifyClient({
			token: token,
		});
	} else {
		client = null;
	}
}

// Wrapper function to ensure client is initialized before each operation
function ensureClient<T>(operation: (client: ApifyClient) => T): T {
	if (!client) {
		throw new Error(
			"ApifyClient is not initialized. Please set your Apify API key.",
		);
	}
	return operation(client);
}

// Function to create a task
export async function createTask(
	actorId: string,
	input: Record<string, unknown>,
) {
	return ensureClient(async (client) => {
		try {
			const task = await client.tasks().create({
				actorId,
				name: `Task for ${actorId}`,
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

// Function to run a task
export async function runTask(taskId: string) {
	return ensureClient(async (client) => {
		try {
			const run = await client.task(taskId).run();
			return run;
		} catch (error) {
			console.error("Error running task:", error);
			throw error;
		}
	});
}

// ... (implement other functions similarly)

// Subscribe to changes in the apifyKey store
apifyKey.subscribe(() => {
	initializeApifyClient();
});
