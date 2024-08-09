import {
  OPENAI_API_KEY,
  OPENAI_TRACTOR_KEY,
  OPENAI_ORG,
  OPENAI_TRACTOR_PROJ,
} from "$env/static/private";
import { json } from "@sveltejs/kit";
import OpenAI from "openai";
import { keywordPrompt } from "./keywordPrompt";

const openai = new OpenAI({
  organization: OPENAI_ORG,
  project: OPENAI_TRACTOR_PROJ,
  apiKey: OPENAI_TRACTOR_KEY,
});

/*Schedule keyword*/
export const POST = async ({ fetch, request }) => {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }
    const { prompt } = await request.json();

    const stream = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.4,
      stream: true,
      messages: [
        {
          role: "system",
          content: keywordPrompt,
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
