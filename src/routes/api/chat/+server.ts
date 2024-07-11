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

		const stream = await openai.chat.completions.create({
			model: "gpt-4",
			temperature: 0.7,
			stream: true,
			messages: [
				{
					role: "system",
					content: systemPrompt,
				},
				{ role: "user", content: prompt },
			],
		});

		return new Response(
			new ReadableStream({
				async start(controller) {
					for await (const part of stream) {
						const content = part.choices[0]?.delta?.content || "";
						controller.enqueue(content);
					}
					controller.close();
				},
			}),
			{
				headers: {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				},
			},
		);
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
