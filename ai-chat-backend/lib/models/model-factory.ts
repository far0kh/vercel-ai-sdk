import { type ChatPipe, type AIModel, ModelType } from "@/lib/types"
import { OpenAIModel } from "@/lib/models/openai-model"
import { GeminiModel } from "@/lib/models/gemini-model"

export function getModelForPipe(pipe: ChatPipe): AIModel {
  switch (pipe.modelType) {
    case ModelType.OPENAI:
      return new OpenAIModel(pipe.config)
    case ModelType.GEMINI:
      return new GeminiModel(pipe.config)
    default:
      throw new Error(`Unsupported model type: ${pipe.modelType}`)
  }
}

