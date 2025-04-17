import { getOrders, getTrackingInformation, ORDERS } from "@/components/data";
import { openai } from "@ai-sdk/openai";
import { google } from '@ai-sdk/google';
import { generateText, streamText } from "ai";
import { z } from "zod";

export async function POST(request: Request) {
  const { messages } = await request.json();

  // const { text } = await generateText({
  //   model: google('gemini-1.5-pro-latest'),
  //   prompt: 'Write a vegetarian lasagna recipe for 4 people.',
  // });

  const stream = streamText({
    // model: openai("gpt-4o"),
    model: google('gemini-2.0-flash'),
    system: `\
      - you are a friendly package tracking assistant
      - your responses are concise
      - you do not ever use lists, tables, or bullet points; instead, you provide a single response
    `,
    messages,
    maxSteps: 5,
    tools: {
      listOrders: {
        description: "list all orders",
        parameters: z.object({}),
        execute: async function ({ }) {
          const orders = getOrders();
          return orders;
        },
      },
      filterOrders: {
        description: "filter orders by a part of order name",
        parameters: z.object({
          orderName: z.string(),
        }),
        execute: async function ({ orderName }) {
          const orders = getOrders();
          return orders.filter((order) => order.name.toLowerCase().includes(orderName.toLowerCase()));
        },
      },
      viewTrackingInformation: {
        description: "view tracking information for a specific order",
        parameters: z.object({
          orderId: z.string(),
        }),
        execute: async function ({ orderId }) {
          const trackingInformation = getTrackingInformation({ orderId });
          await new Promise((resolve) => setTimeout(resolve, 500));
          return trackingInformation;
        },
      },
    },
  });

  return stream.toDataStreamResponse();
}
