import { json } from "@sveltejs/kit";
import { getOpenAIResponse } from "../openai";
import type { RequestHandler } from "./$types";
import { systemPrompt } from "./prompt";


export const POST: RequestHandler = async ({ fetch, request }) => {
	try {
		const { prompt } = await request.json();
		console.log("Received terms and cron:", prompt);
		console.log("Sending request to OpenAI API...");

		const response = await getOpenAIResponse(prompt, systemPrompt);
		return response;
	} catch (error) {
		console.error("Error in API route:", error);
		return json(
			{
				error: error instanceof Error ? error.message : "An unknown error occurred",
			},
			{ status: 500 },
		);
	}
};
