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
