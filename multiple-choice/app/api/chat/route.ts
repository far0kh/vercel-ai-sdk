import { type CoreMessage, streamText, tool } from "ai"
import { google } from "@ai-sdk/google"
import { z } from "zod"

export async function POST(req: Request) {
  const { messages }: { messages: CoreMessage[] } = await req.json()

  const result = streamText({
    model: google("gemini-2.0-flash"),
    system: "You are a helpful assistant.",
    messages,
    tools: {
      generateMultipleChoiceOptions: tool({
        description: "If you want to suggest some options to choose by user, provide the question and options. If user can select more options at once, set multipleSelection to true.",
        parameters: z.object({
          title: z.string().describe("The question for suggesting options"),
          options: z.string().array().describe("The options to choose from"),
          multipleSelection: z.boolean().optional().describe("Whether the user can select multiple options"),
        }),
        execute: async ({ title, options, multipleSelection = false }) => {
          return {
            title,
            options,
            multipleSelection,
          }
        },
      }),
      generateMultipleChoiceQuestion: tool({
        description: "If you want to ask a question with multiple choice answers or suggest some items to choose by user, provide the question and choices.",
        parameters: z.object({
          question: z.string().describe("The question to be asked"),
          choices: z.string().array().describe("The answer choices for the question"),
          // choices: z.object({
          //   id: z.string().describe("The ID of the choice"),
          //   text: z.string().describe("The text of the choice"),
          // }).array().describe("The answer choices for the question"),
          // difficulty: z.enum(["easy", "medium", "hard"]).optional().describe("The difficulty level of the question"),
        }),
        execute: async ({ question, choices }) => {
          return {
            question,
            choices,
            // correctAnswer: "C", // In a real app, this would be dynamically determined
            // explanation: `This is an explanation about the correct answer related to ${topic}.`,
          }
        },
      }),
    },
  })

  return result.toDataStreamResponse()
}
