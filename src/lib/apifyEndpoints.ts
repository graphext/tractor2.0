import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";
import { dev } from "$app/environment";

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

export class ApifyClient {
	constructor(public actorId: string) {}

	async createTask(input: Record<string, unknown>) {
		const token = get(apifyKey);
		const tokenEnd = token.slice(-4);

		const endpoint = "/actor-tasks";
		const body = JSON.stringify({
			actId: this.actorId,
			name: `TRCTR-${tokenEnd}-${Math.floor(Math.random() * 10000)
				.toString()
				.padStart(5, "0")}`,
			options: {
				build: "latest",
			},
			input: {
				...input,
			},
		});

		if (dev) console.log("Request Body:", body);

		return apifyFetch(endpoint, { method: "POST", body });
	}

	async runTask(taskId: string) {
		const endpoint = `/actor-tasks/${taskId}/runs`;
		return apifyFetch(endpoint, { method: "POST" });
	}

	async getRunStatus(runId: string) {
		const endpoint = `/actor-runs/${runId}`;
		const data = await apifyFetch(endpoint);
		return data;
	}

	async getDatasetInfo(runId: string) {
		const runStatus = await this.getRunStatus(runId);
	
		const datasetId = runStatus.data.defaultDatasetId;
	
	
		let endpoint = `/datasets/${datasetId}`;
		const data = await apifyFetch(endpoint);
		return data;
	}

	async getDatasetLength(runId: string) {
		const endpoint = `/actor-runs/${runId}/dataset/items?clean=true&format=json`;
		const data = await apifyFetch(endpoint);
		return data.length;
	}

	async getDatasetLink(
		runId: string,
		format: "csv" | "json" = "csv",
	) {
		const token = get(apifyKey);
		if (!token) {
			throw new Error("Apify API token is not set");
		}
	
		let endpoint = `/actor-runs/${runId}/dataset/items?token=${token}&format=${format}&attachment=true&clean=true`;

		return `${BASE_URL}${endpoint}`;
	}

	async getPrivateUserData() {
		const endpoint = "/users/me";
		const data = await apifyFetch(endpoint);
		return data;
	}
}

export class ApifyScheduler {
	constructor(private apifyClient: ApifyClient) {}

	async scheduleTask({
		scheduledTaskInput,
		historicDataInput,
		cronExpression,
		description,
		fields,
	}) {
		const keyword = await generateScheduleKeyWord(`${scheduledTaskInput.searchTerms}

${cronExpression}`);

		const scheduleableTaskData = await this.apifyClient.createTask(scheduledTaskInput);
		const scheduleableTaskId = scheduleableTaskData.data.id;

		const historicTaskData = await this.apifyClient.createTask(historicDataInput);
		const historicTaskId = historicTaskData.data.id;
		const historicDataRun = await this.apifyClient.runTask(historicTaskId);
		const datasetId = historicDataRun.data.defaultDatasetId;

		const schedulesEndpoint = "/schedules";
		const userId = (await this.apifyClient.getPrivateUserData()).data.id;

		const token = get(apifyKey);
		const body = JSON.stringify({
			name: `TRCTR-${keyword}-${token.slice(-4)}-${Math.floor(
				Math.random() * 10000,
			)
				.toString()
				.padStart(5, "0")}`,
			userId: userId,
			cronExpression: cronExpression,
			isEnabled: true,
			actions: [
				{
					type: "RUN_ACTOR_TASK",
					taskId: scheduleableTaskId,
					input: {
						...scheduledTaskInput,
						fields: fields,
					},
				},
			],
		});

		if (dev) console.log("Schedule Request Body:", body);

		const scheduleData = await apifyFetch(schedulesEndpoint, {
			method: "POST",
			body,
		});

		return { scheduleData, datasetId };
	}
}

async function generateDatasetName(prompt: string) {
	try {
		const res = await fetch("/api/ids", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ prompt: prompt }),
		});

		if (!res.ok) {
			const errorData = await res.json();
			throw new Error(
				errorData.error || `HTTP error! status: ${res.status}`,
			);
		}

		return res.text();
	} catch (err) {
		console.error("Error:", err);
		error =
			err instanceof Error
				? err.message
				: "An unknown error occurred";
	}
}

async function generateScheduleKeyWord(prompt: string) {
	try {
		const res = await fetch("/api/schedulekw", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ prompt: prompt }),
		});

		if (!res.ok) {
			const errorData = await res.json();
			throw new Error(
				errorData.error || `HTTP error! status: ${res.status}`,
			);
		}

		return res.text();
	} catch (err) {
		console.error("Error:", err);
		error =
			err instanceof Error
				? err.message
				: "An unknown error occurred";
	}
}
