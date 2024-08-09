import type { DateRange, Selected } from "bits-ui";
import { frequencyStore } from "./stores/store";
import { get } from "svelte/store";

export function cleanText(text: string): string {
	text = text.replace(/[^\S\r\n]+/g, " ");

	text = text.replace(/[^\x20-\x7E\r\n]/g, "");

	text = text
		.split("\n")
		.map((line) => line.replace(/^[\s,]+|[\s,]+$/g, ""))
		.join("\n");

	text = text.replace(/^\n+|\n+$/g, "");

	text = text.replace(/,+$/, "");

	return text;
}

export function cleanQueries(queries: string[]): string[] {
	let output: string[] = [];

	for (const q of queries) {
		output.push(cleanText(q));
	}

	return output;
}

type TwitterInterval = {
	until: string;
	since: string;
};

type TimeUnit = "day" | "week" | "month" | "year";

export function getDateRangeScope(dateRange: DateRange): TimeUnit {
	const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

	if (!dateRange) {
		return "day";
	}

	const endDate = new Date(dateRange.end?.toString());
	const startDate = new Date(dateRange.start?.toString());

	const diff = endDate.getTime() - startDate.getTime();

	const msPerDay = 1000 * 60 * 60 * 24;
	const msPerWeek = msPerDay * 7;
	const avgMsPerMonth = msPerDay * 30.44; // average number of days in a month
	const avgMsPerYear = msPerDay * 365.25; // accounting for leap years

	const yearsDiff = Math.floor(diff / avgMsPerYear);
	const monthsDiff = Math.floor(diff / avgMsPerMonth);
	const weeksDiff = Math.floor(diff / msPerWeek);
	const daysDiff = Math.floor(diff / msPerDay);

	if (yearsDiff >= 1) {
		return "year";
	} else if (monthsDiff >= 1) {
		return "month";
	} else if (weeksDiff >= 1) {
		return "week";
	} else {
		return "day";
	}
}

export function getSelectionOptions(dateRange: DateRange) {
	const scope = getDateRangeScope(dateRange);

	let options = [
		{ value: "Daily", label: "Daily", disabled: false },
		{ value: "Weekly", label: "Weekly", disabled: true },
		{ value: "Monthly", label: "Monthly", disabled: true },
		{ value: "Anually", label: "Anually", disabled: true },
	];

	switch (scope) {
		case "year":
			options[3].disabled = false;
		case "month":
			options[2].disabled = false;
			if (get(frequencyStore) == "Anually") frequencyStore.set("Monthly");
		case "week":
			options[1].disabled = false;
			const fStore = get(frequencyStore);
			if (fStore == "Monthly" || fStore == "Anually")
				frequencyStore.set("Weekly");
			break;
	}

	return options;
}

export function groupTimeRanges(timeSteps: Date[], selectedRange: DateRange) {
	if (!timeSteps || !selectedRange) {
		return [];
	}

	if (
		selectedRange.start > selectedRange.end ||
		timeSteps.length == 0 ||
		!timeSteps
	) {
		return [];
	}

	let output: TwitterInterval[] = [];

	let i = 1;
	for (i; i < timeSteps.length; i++) {
		const since = twitterDateFormat(timeSteps[i - 1]);
		const until = twitterDateFormat(timeSteps[i]);

		output.push({ since: since, until: until });
	}

	output.push({
		since: twitterDateFormat(timeSteps[i - 1]),
		until: twitterDateFormat(
			new Date(
				selectedRange.end?.year,
				selectedRange.end?.month - 1,
				selectedRange.end?.day,
			),
		),
	});

	return output;
}

export function addListsToQueries(queries: string, lists: Selected<string>[]) {
	if (queries == "" || !queries) return "";
	if (!lists || lists.length == 0) return queries;

	const queriesSplit = queries.trim().split("\n");
	let queriesWithLists = "";

	for (let q of queriesSplit) {
		q = q.trim();
		for (const l of lists) {
			const listID = l.value;
			q += ` list:${listID}`;
		}
		queriesWithLists += `${q.trim()}\n`;
	}

	return queriesWithLists;
}

export async function jsonToCsv(
	url: string,
	customColumnOrder?: string[],
): Promise<Blob> {
	try {
		// Fetch JSON data from the provided URL
		const response = await fetch(url);
		if (!response.ok) {
			throw new Error(`HTTP error! status: ${response.status}`);
		}

		console.log(response);
		const jsonData: any[] = await response.json();

		if (!Array.isArray(jsonData) || jsonData.length === 0) {
			throw new Error("Invalid JSON data: expected a non-empty array");
		}

		// Get all available headers from the first object
		const allHeaders = Object.keys(jsonData[0]);

		// Determine the final header order
		let headers: string[];
		if (customColumnOrder) {
			// Use custom order, but include any missing headers at the end
			const missingHeaders = allHeaders.filter(
				(h) => !customColumnOrder.includes(h),
			);
			headers = [...customColumnOrder, ...missingHeaders];
		} else {
			headers = allHeaders;
		}

		let csvString = headers.join(",") + "\n";

		const formatValue = (value: any): string => {
			if (Array.isArray(value)) {
				// Convert array to comma-separated string and wrap in quotes
				return `"${value.toString()}"`;
			} else if (typeof value === "string") {
				// Wrap strings in quotes if they contain commas, newlines, or quotes
				return value.includes(",") ||
					value.includes("\n") ||
					value.includes('"')
					? `"${value.replace(/"/g, '""')}"`
					: value;
			} else {
				// For other types, convert to string
				return value.toString();
			}
		};

		// Add data rows
		jsonData.forEach((item) => {
			const row = headers.map((header) => {
				const value = item[header];
				return value !== undefined ? formatValue(value) : "";
			});
			csvString += row.join(",") + "\n";
		});

		return new Blob([csvString], { type: "text/csv;charset=utf-8;" });
	} catch (error) {
		console.error("Error converting JSON to CSV:", error);
		throw error;
	}
}

export function enrichQueries(
	queries: string,
	timeSteps: Date[],
	selectedRange: DateRange,
	lists: Selected<string>[],
) {
	if (queries == "" || !queries) return "";

	let queriesOverTime = spreadQueriesOverTime(
		queries,
		timeSteps,
		selectedRange,
	);

	let queriesWithLists = addListsToQueries(queriesOverTime, lists);

	return queriesWithLists;
}

export function spreadQueriesOverTime(
	queries: string,
	timeSteps: Date[],
	selectedRange: DateRange,
) {
	if (queries == "" || !queries) return "";
	if (!timeSteps || !selectedRange) return queries;

	const queriesSplit = queries.split("\n");
	let queriesSpreadOverTime = "";

	const intervalsGrouped = groupTimeRanges(timeSteps, selectedRange);

	if (intervalsGrouped.length == 0 || !intervalsGrouped) {
		return queries;
	}

	for (let q of queriesSplit) {
		for (let i = 0; i < intervalsGrouped.length; i++) {
			const since = intervalsGrouped[i].since;
			const until = intervalsGrouped[i].until;
			q = q.trim();

			queriesSpreadOverTime += `${q} since:${since} until:${until}\n`;
		}
		queriesSpreadOverTime += "\n";
	}

	return queriesSpreadOverTime;
}

export function twitterDateFormat(date: Date) {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0"); //bitch
	const year = date.getFullYear();

	return `${year}-${month}-${day}`;
}

/*************/
`
n is the intervalNumber chosen by user

minutely: */n * * * * 
hourly: 0 */n * * *
daily: 0 0 */n * * -> maybe substitute initial 0's for minute and hour
weekly: 0 0 * * 1 -> maybe substitute 1 for day of week, 0's for minute and hour
montly: 0 0 1 */1 * -> maybe substitute initial 0's for minute and hour, substitute 1 for current day of month
yearly: 0 0 1 */n * -> maybe substitute initial 0's for minute and hour
`;

export function composeCronExpression(
	intervalNumber: number,
	frequency: string,
	time?: { hour: number; minute: number },
) {
	const today = new Date();
	const dayOfMonth = today.getDate();

	const min = time != undefined ? time.minute : today.getMinutes();
	const h = time != undefined ? time.hour : today.getHours();

	let cronExpression: string = "";

	switch (frequency) {
		case "minute":
			cronExpression = `*/${intervalNumber} * * * *`;
			break;

		case "hour":
			cronExpression = `${min} */${intervalNumber} * * *`;
			break;

		case "day":
			cronExpression = `${min} ${h} */${intervalNumber} * *`;
			break;

		case "month":
			cronExpression = `${min} ${h} 1 */${intervalNumber} *`;
			break;

		case "year":
			cronExpression = `${min} ${h} ${dayOfMonth} */${12 * intervalNumber} *`;
			break;
	}

	return cronExpression;
}
