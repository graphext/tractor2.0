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
