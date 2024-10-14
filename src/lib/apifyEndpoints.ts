import { get } from "svelte/store";
import { apifyKey } from "./stores/apifyStore";
import { dev } from "$app/environment";
import { MERGE_DEDUP_URL } from "./actors";

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

export async function getRunsForTask(taskId: string) {
	const endpoint = `/actor-tasks/${taskId}/runs`;
	const data = await apifyFetch(endpoint);
	return data;
}
export async function getTasks() {
	const endpoint = "/actor-tasks?limit=80&desc=true";
	const data = await apifyFetch(endpoint);
	return data;
}

export async function getPrivateUserData() {
	const endpoint = "/users/me";
	const data = await apifyFetch(endpoint);
	return data;
}

export class ApifyClient {
	constructor(public actorId: string) { }

	async createTask(input: Record<string, unknown>) {
		const token = get(apifyKey);
		const tokenEnd = token.slice(-4);

		const endpoint = "/actor-tasks";
		const body = JSON.stringify({
			actId: this.actorId,
			name: `TRCTR-${tokenEnd}-${Math.floor(Math.random() * 100000)
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

	async abortRun(runId: string) {
		const endpoint = `/actor-runs/${runId}/abort`;
		return apifyFetch(endpoint, { method: "POST" });
	}

	async resurrectRun(runId: string) {
		const endpoint = `/actor-runs/${runId}/resurrect`;
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

	async getDatasetContent(runId: string, omitColumns: string[] = []) {
		let omitColumnsParams = "";
		if (omitColumns.length > 0)
			omitColumnsParams = "&omit=" + omitColumns.join(",");

		const endpoint = `/actor-runs/${runId}/dataset/items?clean=true&format=json${omitColumnsParams}`;
		const data = await apifyFetch(endpoint);
		return { data: data, length: data.length };
	}

	async getDatasetLink({
		runId,
		format = "json",
		omitColumns,
		includeOnly,
		unwind,
	}: {
		runId: string | null;
		format?: "csv" | "json";
		omitColumns?: string[];
		includeOnly?: string[];
		unwind?: string[];
	}) {
		const token = get(apifyKey);
		if (!token) {
			throw new Error("Apify API token is not set");
		}

		let omitColumnsParams = "";
		if (omitColumns != undefined)
			omitColumnsParams = "&omit=" + omitColumns.join(",");

		let includeOnlyParams = "";
		if (includeOnly != undefined)
			includeOnlyParams = "&fields=" + includeOnly.join(",");

		let unwindParams = "";
		if (unwind != undefined) {
			unwindParams = "&unwind=" + unwind.join(",");
		}

		let endpoint = `/actor-runs/${runId}/dataset/items?token=${token}&format=${format}&attachment=true&clean=true${omitColumnsParams}${includeOnlyParams}${unwindParams}`;

		console.log(`${BASE_URL}${endpoint}`);

		return `${BASE_URL}${endpoint}`;
	}

	async getPrivateUserData() {
		const endpoint = "/users/me";
		const data = await apifyFetch(endpoint);
		return data;
	}
}

export class ApifyScheduler {
	constructor(private apifyClient: ApifyClient) { }

	async createWebhook(requestBody: Record<string, unknown>) {
		const endpoint = `/webhooks`;
		return await apifyFetch(endpoint, {
			method: "POST",
			body: JSON.stringify(requestBody),
		});
	}

	async scheduleTask({
		scheduledTaskInput,
		historicDataInput,
		cronExpression,
		description,
		fields,
	}: {
		scheduledTaskInput: Record<string, unknown>;
		historicDataInput: Record<string, unknown>;
		cronExpression: string;
		description: string;
		fields: string[];
	}) {
		const keyword =
			await generateScheduleKeyWord(`${scheduledTaskInput.searchTerms}
${cronExpression}`);

		const scheduleableTaskData =
			await this.apifyClient.createTask(scheduledTaskInput);
		const scheduleableTaskId = scheduleableTaskData.data.id;

		if (!scheduleableTaskId) {
			throw new Error(
				"Failed to create scheduleable task: Task ID is undefined",
			);
		}

		const historicTaskData =
			await this.apifyClient.createTask(historicDataInput);
		const historicTaskId = historicTaskData.data.id;

		if (!historicTaskId) {
			throw new Error("Failed to create historic task: Task ID is undefined");
		}

		const historicDataRun = await this.apifyClient.runTask(historicTaskId);
		const datasetId = historicDataRun.data.defaultDatasetId;

		const userId = (await this.apifyClient.getPrivateUserData()).data.id;

		const token = get(apifyKey);
		const body = JSON.stringify({
			name: `TRCTR-${keyword}-${token.slice(-4)}-${Math.floor(
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
					actorTaskId: scheduleableTaskId,
					actorId: this.apifyClient.actorId,
				},
			],
		});

		const datasetName =
			await generateDatasetName(`${scheduledTaskInput.searchTerms}
	
	${cronExpression}`);

		try {
			await apifyFetch(`/datasets/${datasetId}`, {
				method: "PUT",
				body: JSON.stringify({
					name: datasetName,
				}),
			});
		} catch (e) {
			console.log(e);

			await apifyFetch(`/datasets/${datasetId}`, {
				method: "PUT",
				body: JSON.stringify({
					name: `${datasetName}-${Math.floor(Math.random() * 1000)}`,
				}),
			});
		}

		// Update webhook payload
		const webhookPayload = {
			outputDatasetId: datasetId,
			datasetIds: ["{{resource.defaultDatasetId}}", datasetId],
			mode: "dedup-as-loading",
			output: "unique-items",
			fields: fields,
		};

		const webookConfig: Record<string, unknown> = {
			requestUrl: MERGE_DEDUP_URL,
			eventTypes: ["ACTOR.RUN.SUCCEEDED"],
			condition: {
				actorTaskId: scheduleableTaskId,
			},
			shouldInterpolateStrings: true,
			isApifyIntegration: true,
			payloadTemplate: JSON.stringify(webhookPayload),
		};

		try {
			const scheduleData = await apifyFetch("/schedules", {
				method: "POST",
				body,
			});

			const webhookData = await this.createWebhook(webookConfig);

			return {
				scheduleData: scheduleData,
				webhookData: webhookData,
				datasetId: datasetId,
			};
		} catch (e) {
			console.error("Couldn't setup schedule", e);
			throw e;
		}
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
			throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
		}

		return res.text();
	} catch (err) {
		console.error("Error:", err);
		const errorMessage =
			err instanceof Error ? err.message : "An unknown error occurred";
		throw new Error(errorMessage);
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
			throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
		}

		return res.text();
	} catch (err) {
		console.error("Error:", err);
		const errorMessage =
			err instanceof Error ? err.message : "An unknown error occurred";
		throw new Error(errorMessage);
	}
}
