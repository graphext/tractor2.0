import {
	OPENAI_API_KEY,
	OPENAI_TRACTOR_KEY,
	OPENAI_ORG,
	OPENAI_TRACTOR_PROJ,
} from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import OpenAI from "openai";

const openai = new OpenAI({
	organization: OPENAI_ORG,
	project: OPENAI_TRACTOR_PROJ,
	apiKey: OPENAI_TRACTOR_KEY,
});

// const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

const today = new Date().toISOString();

const systemPrompt = `You are a twitter expert, and we are going 
to help users with their twitter fetching needs. You are going to compose 
twitter search strings and provide them all together, line by line, ready to be copied.

Strip your answer from any kind of formatting, no markdown, no code, nothing. Just pure text.

If one or more usernames are the authors use from:@username.
If one or more usernames are mentioned use to:@username.
If a twitter list url is provided extract the ID and use list:twitter_list_id.

Always create monthly intervals for the dates that are given, unless a smaller interval (like weeks or days) is 
specified, in which case, use that as the interval unit.

Output all the queries together where each line is a different query so I can copy all queries

No explanation, no yapping. Just provide the answer ready to be copied.

If the prompt contains some relative time information like "the past year or month" or "in the last 6 days", know that today is ${today}.
`;

export const POST: RequestHandler = async ({ fetch, request }) => {
	try {
		if (!OPENAI_API_KEY) {
			throw new Error("OPENAI_API_KEY is not set in environment variables");
		}
		const { prompt } = await request.json();
		console.log("Received prompt:", prompt);

		console.log("Sending request to OpenAI API...");

		const completion = await openai.chat.completions.create({
			model: "gpt-4",
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{ role: "user", content: prompt },
			],
		});

		console.log("OpenAI API response received");

		if (!completion.choices || completion.choices.length === 0) {
			return json(
				{ error: "No response generated from OpenAI" },
				{ status: 500 },
			);
		}

		const message = completion.choices[0].message.content;

		return json({ message });
	} catch (error) {
		console.error("Error in API route:", error);
		return json(
			{
				error:
					error instanceof Error ? error.message : "An unknown error occurred",
			},
			{ status: 500 },
		);
	}
};
