import { json } from "@sveltejs/kit";
import { competitorsPrompt } from "./competitorsPrompt";
import { getOpenAIResponse } from "../openai";

export const POST = async ({ fetch, request }) => {
	try {
		const { prompt } = await request.json();
		const response = await getOpenAIResponse(prompt, competitorsPrompt);
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
