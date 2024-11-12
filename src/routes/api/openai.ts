import { OPENAI_API_KEY, OPENAI_TRACTOR_KEY, OPENAI_ORG, OPENAI_TRACTOR_PROJ } from "$env/static/private";
import OpenAI from "openai";

const openai = new OpenAI({
	organization: OPENAI_ORG,
	project: OPENAI_TRACTOR_PROJ,
	apiKey: OPENAI_TRACTOR_KEY,
});

export async function getOpenAIResponse(prompt: string, systemPrompt: string) {
	if (!OPENAI_API_KEY) {
		throw new Error("OPENAI_API_KEY is not set in environment variables");
	}

	const stream = await openai.chat.completions.create({
		model: "gpt-4o-mini",
		temperature: 0.3,
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
}
