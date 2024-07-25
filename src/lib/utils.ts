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

	console.log("[enrichQueries]", queriesOverTime);

	let queriesWithLists = addListsToQueries(queriesOverTime, lists);

	console.log("[enrichQueries]", queriesWithLists);

	return queriesWithLists;
}

export function spreadQueriesOverTime(
	queries: string,
	timeSteps: Date[],
	selectedRange: DateRange,
) {
	console.log("[spreadQueriesOverTime]", queries, timeSteps, selectedRange);
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
