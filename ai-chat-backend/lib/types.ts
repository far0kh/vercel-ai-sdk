export enum ModelType {
  OPENAI = "openai",
  GEMINI = "gemini",
}

export interface ModelConfig {
  model?: string
  temperature?: number
  maxTokens?: number
  systemPrompt?: string
  tools?: string[]
  [key: string]: any
}

export interface ChatPipe {
  id: string
  name: string
  description: string
  modelType: ModelType
  config: ModelConfig
}

export interface PipeConfig extends ChatPipe {}

export interface Message {
  role: "user" | "assistant" | "system"
  content: string
  id?: string
}

export interface AIModel {
  generateResponse(messages: Message[], options?: any): Promise<Response>
}

