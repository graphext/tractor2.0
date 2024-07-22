import type { DateRange } from "bits-ui";

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

export function groupTimeRanges(timeSteps: Date[], selectedRange: DateRange) {
	if (!timeSteps || !selectedRange) return;

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

export function spreadQueriesOverTime(
	queries: string,
	timeSteps: Date[],
	selectedRange: DateRange,
) {
	if (!timeSteps || !selectedRange) return queries;

	const queriesSplit = queries.split("\n");
	let queriesSpreadOverTime = "";

	const intervalsGrouped = groupTimeRanges(timeSteps, selectedRange);

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
