import { z } from "zod"
import { tool } from "ai"

export class ToolRegistry {
  private tools: Record<string, any> = {}

  constructor() {
    this.registerDefaultTools()
  }

  private registerDefaultTools() {
    // Weather tool example
    this.tools["getWeather"] = tool({
      description: "Get the current weather in a location",
      parameters: z.object({
        location: z.string().describe("The city and state, e.g. San Francisco, CA"),
      }),
      execute: async ({ location }) => {
        // In a real app, you would call a weather API here
        return {
          location,
          temperature: Math.round(Math.random() * 30 + 50), // Random temp between 50-80F
          conditions: ["sunny", "cloudy", "rainy", "stormy"][Math.floor(Math.random() * 4)],
        }
      },
    })

    // Search tool example
    this.tools["searchKnowledgeBase"] = tool({
      description: "Search the knowledge base for information",
      parameters: z.object({
        query: z.string().describe("The search query"),
      }),
      execute: async ({ query }) => {
        // In a real app, you would search a database or API
        return {
          results: [
            { title: `Result for ${query}`, snippet: `This is information about ${query}` },
            { title: `Another result for ${query}`, snippet: `More information about ${query}` },
          ],
        }
      },
    })
  }

  getTools(toolNames?: string[]) {
    if (!toolNames || toolNames.length === 0) {
      return this.tools
    }

    return Object.fromEntries(Object.entries(this.tools).filter(([name]) => toolNames.includes(name)))
  }
}

