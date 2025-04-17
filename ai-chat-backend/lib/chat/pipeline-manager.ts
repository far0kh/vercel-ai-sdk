import type { ChatPipe } from "@/lib/types"
import { loadPipeConfigurations } from "@/lib/config/pipes-config"
import { ResponseCache } from "@/lib/cache/response-cache"

export class ChatPipelineManager {
  private pipes: Map<string, ChatPipe> = new Map()
  private initialized = false
  private responseCache: ResponseCache

  constructor() {
    this.responseCache = new ResponseCache(30) // 30 minutes TTL
    this.initialize()
  }

  private async initialize() {
    if (this.initialized) return

    const pipeConfigs = await loadPipeConfigurations()

    for (const config of pipeConfigs) {
      this.pipes.set(config.id, {
        id: config.id,
        name: config.name,
        description: config.description,
        modelType: config.modelType,
        config: config.config,
      })
    }

    this.initialized = true
  }

  async getPipe(pipeId: string): Promise<ChatPipe | undefined> {
    await this.initialize()
    return this.pipes.get(pipeId)
  }

  async listPipes(): Promise<ChatPipe[]> {
    await this.initialize()
    return Array.from(this.pipes.values())
  }

  getResponseCache(): ResponseCache {
    return this.responseCache
  }
}

