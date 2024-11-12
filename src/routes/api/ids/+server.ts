import { json } from "@sveltejs/kit";
import { idPrompt } from "./idPrompt";
import { getOpenAIResponse } from "../openai";

export const POST = async ({ fetch, request }) => {
  try {
    const { prompt } = await request.json();
    console.log("Received terms and cron:", prompt);
    console.log("Sending request to OpenAI API...");

    const response = await getOpenAIResponse(prompt, idPrompt);
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
