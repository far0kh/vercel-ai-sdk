import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"
import type { AIModel, ModelConfig, Message } from "@/lib/types"
import { ToolRegistry } from "@/lib/tools/tool-registry"

export class OpenAIModel implements AIModel {
  private config: ModelConfig
  private toolRegistry: ToolRegistry

  constructor(config: ModelConfig) {
    this.config = config
    this.toolRegistry = new ToolRegistry()
  }

  async generateResponse(messages: Message[], options: any = {}) {
    const modelName = this.config.model || "gpt-4o"

    // Get tools if specified in config or options
    const toolNames = options.tools || this.config.tools
    const tools = toolNames ? this.toolRegistry.getTools(toolNames) : undefined

    const result = streamText({
      model: openai(modelName),
      messages,
      temperature: options.temperature || this.config.temperature || 0.7,
      maxTokens: options.maxTokens || this.config.maxTokens,
      system: this.config.systemPrompt,
      tools: tools,
    })

    return result.toDataStreamResponse()
  }
}

