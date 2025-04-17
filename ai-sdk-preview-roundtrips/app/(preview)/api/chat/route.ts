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
      - you are a useful AI assistant that helps users get data from a URL
      - you are also a friendly package tracking assistant
      - your responses are concise
      - you do not ever use lists, tables, or bullet points; instead, you provide a single response
    `,
    messages,
    maxSteps: 5,
    tools: {
      webSearch: {
        description: "get data from a URL",
        parameters: z.object({
          url: z.string(),
        }),
        execute: async function ({ url }) {
          const { html, title, description, content } = await fetchWebContent(url);
          await new Promise((resolve) => setTimeout(resolve, 500));
          return {
            html,
            title,
            description,
            content,
          };
        },
      },
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
          await new Promise((resolve) => setTimeout(resolve, 500));
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

async function fetchWebContent(url: string) {
  try {
    // Add https:// if not present
    if (!/^https?:\/\//i.test(url)) {
      url = "https://" + url;
    }

    // Fetch the URL
    const response = await fetch(url)
    const html = await response.text()

    // Basic extraction of title, description and content
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    const title = titleMatch ? titleMatch[1] : "No title found"

    const descriptionMatch = html.match(/<meta name="description" content="(.*?)"/i)
    const description = descriptionMatch ? descriptionMatch[1] : "No description found"

    // Extract text content (simplified approach)
    let content = html
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
      .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
      .replace(/<[^>]*>/g, " ")
      .replace(/\s{2,}/g, " ")
      .trim()

    // Limit content length
    content = content.substring(0, 1500) + (content.length > 1500 ? "..." : "")

    return { html, title, description, content }
  } catch (error) {
    console.error("Error fetching URL:", error)
    throw new Error("Failed to fetch website content")
  }
}
