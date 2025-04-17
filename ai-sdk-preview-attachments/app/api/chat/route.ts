import { google } from "@ai-sdk/google";
import { streamText, LanguageModel } from "ai";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: google('gemini-2.0-flash') as LanguageModel,
    system:
      "do not respond on markdown or lists, keep your responses brief, you can ask the user to upload images or documents if it could help you understand the problem better",
    messages,
  });

  return result.toDataStreamResponse();
}
