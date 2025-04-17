import type { AIModel, ModelConfig, Message } from "@/lib/types"
import { GoogleGenerativeAI } from "@google/generative-ai"

export class GeminiModel implements AIModel {
  private config: ModelConfig
  private genAI: GoogleGenerativeAI

  constructor(config: ModelConfig) {
    this.config = config
    this.genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "")
  }

  async generateResponse(messages: Message[], options: any = {}) {
    const modelName = this.config.model || "gemini-2.0-flash"
    const model = this.genAI.getGenerativeModel({ model: modelName })

    // Convert messages to Gemini format
    const geminiMessages = this.convertToGeminiFormat(messages)

    // Create a chat session
    const chat = model.startChat({
      history: geminiMessages.slice(0, -1),
      generationConfig: {
        temperature: options.temperature || this.config.temperature || 0.7,
        maxOutputTokens: options.maxTokens || this.config.maxTokens,
      },
    })

    // Get the last message to send
    const lastMessage = geminiMessages[geminiMessages.length - 1]

    // Stream the response
    const result = await chat.sendMessageStream(lastMessage.parts[0].text)

    const streamingResponse = result.stream
    if (!streamingResponse) {
      throw new Error("Streaming response is not available.")
    }
    // Handle the response stream
    const responseChunks: string[] = []
    for await (const chunk of streamingResponse) {
      const text = chunk.text()
      responseChunks.push(text)
    }
    // Combine the chunks into a single string
    const responseText = responseChunks.join("")
    console.log("Response Text:", responseText);

    // Convert to a Response object with streaming
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of result.stream) {
          const text = chunk.text()
          controller.enqueue(new TextEncoder().encode(JSON.stringify({ text })))
        }
        controller.close()
      },
    })

    console.log("Stream:", stream);


    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  }

  private convertToGeminiFormat(messages: Message[]) {
    return messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }))
  }
}

