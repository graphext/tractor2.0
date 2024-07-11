import {
	OPENAI_API_KEY,
	OPENAI_TRACTOR_KEY,
	OPENAI_ORG,
	OPENAI_TRACTOR_PROJ,
} from "$env/static/private";
import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import OpenAI from "openai";
import { systemPrompt } from "./prompt";

const openai = new OpenAI({
	organization: OPENAI_ORG,
	project: OPENAI_TRACTOR_PROJ,
	apiKey: OPENAI_TRACTOR_KEY,
});

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
