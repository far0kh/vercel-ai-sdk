import { type PipeConfig, ModelType } from "@/lib/types"

// In a real application, this would likely be loaded from a database or external configuration
export async function loadPipeConfigurations(): Promise<PipeConfig[]> {
  return [
    {
      id: "openai-gpt4",
      name: "GPT-4o",
      description: "OpenAI GPT-4o model for general purpose chat",
      modelType: ModelType.OPENAI,
      config: {
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: "You are a helpful assistant.",
      },
    },
    {
      id: "openai-creative",
      name: "Creative Assistant",
      description: "OpenAI model tuned for creative writing",
      modelType: ModelType.OPENAI,
      config: {
        model: "gpt-4o",
        temperature: 0.9,
        maxTokens: 3000,
        systemPrompt: "You are a creative assistant that helps with writing, storytelling, and creative ideas.",
      },
    },
    {
      id: "openai-with-tools",
      name: "Tool-enabled Assistant",
      description: "OpenAI model with access to external tools",
      modelType: ModelType.OPENAI,
      config: {
        model: "gpt-4o",
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: "You are a helpful assistant with access to external tools.",
        tools: ["getWeather", "searchKnowledgeBase"],
      },
    },
    {
      id: "gemini-2-flash",
      name: "Gemini 2.0 Flash",
      description: "Google Gemini 2.0 flash model for general purpose chat",
      modelType: ModelType.GEMINI,
      config: {
        model: "gemini-2.0-flash",
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: "You are a helpful assistant powered by Google Gemini.",
      },
    },
    {
      id: "gemini-technical",
      name: "Technical Assistant",
      description: "Google Gemini model tuned for technical questions",
      modelType: ModelType.GEMINI,
      config: {
        model: "gemini-1.5-pro",
        temperature: 0.3,
        maxTokens: 4000,
        systemPrompt:
          "You are a technical assistant that helps with programming, data science, and technical questions.",
      },
    },
  ]
}

