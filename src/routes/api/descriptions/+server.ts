import { descriptionPrompt } from "./descPrompt";
import { json } from "@sveltejs/kit";
import { getOpenAIResponse } from "../openai";
import type { RequestHandler } from "./$types";


export const POST: RequestHandler = async ({ fetch, request }) => {
  try {
    const { prompt } = await request.json();

    const response = await getOpenAIResponse(prompt, descriptionPrompt);
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
