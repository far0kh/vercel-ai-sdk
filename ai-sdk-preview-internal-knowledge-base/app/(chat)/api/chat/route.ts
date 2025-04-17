import { customModel } from "@/ai";
import { auth } from "@/app/(auth)/auth";
import { createMessage } from "@/app/db";
import { streamText } from "ai";

export async function POST(request: Request) {
  try {
    const { id, messages, selectedFilePathnames } = await request.json();

    const session = await auth();

    if (!session) {
      return new Response("Unauthorized", { status: 401 });
    }

    const result = streamText({
      model: customModel,
      // system:
      //   "you are a friendly assistant! You answer only the question that is relevant to the information or documents provided by the user. keep your responses concise and helpful.",
      // system:
      //   "you are a friendly assistant! You are limited to the information or documents that the user provide. keep your responses concise and helpful.",
      system:
        "you are a friendly assistant! Based on the information or documents that the user provide, and drawing upon your general knowledge of AI and large language models, create a concise and helpful responses for user.",
      // system:
      //   "You are an expert prompt engineer for Gemini for Google Workspace. Using only the information provided in the document, create a template for a perfect prompt that incorporates the four main areas (Persona, Task, Context, and Format) and best practices such as specifying tone, breaking up tasks, giving constraints, assigning a role, and asking for feedback. The template should be easily adaptable for various use cases within Google Workspace (Drive, Docs, Gmail, etc.). Provide an example of how to use the template. The output should be concise and avoid jargon.",
      messages,
      experimental_providerMetadata: {
        files: {
          selection: selectedFilePathnames,
        },
      },
      onFinish: async ({ text }) => {
        await createMessage({
          id,
          messages: [...messages, { role: "assistant", content: text }],
          author: session.user?.email!,
        });
      },
      experimental_telemetry: {
        isEnabled: true,
        functionId: "stream-text",
      },
    });

    return result.toDataStreamResponse({});
  } catch (error) {
    console.error("Error in POST request:", error);
    return new Response("Internal Server Error", { status: 500 });
  }
}
