import type { Message } from "@/lib/types"

interface CacheEntry {
  response: string
  timestamp: number
}

export class ResponseCache {
  private cache: Map<string, CacheEntry> = new Map()
  private readonly TTL: number // Time to live in milliseconds

  constructor(ttlMinutes = 60) {
    this.TTL = ttlMinutes * 60 * 1000
  }

  private generateKey(pipeId: string, messages: Message[]): string {
    // Create a deterministic key from the pipe ID and messages
    const messagesKey = messages.map((m) => `${m.role}:${m.content}`).join("|")

    return `${pipeId}:${messagesKey}`
  }

  get(pipeId: string, messages: Message[]): string | null {
    const key = this.generateKey(pipeId, messages)
    const entry = this.cache.get(key)

    if (!entry) {
      return null
    }

    // Check if the entry has expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key)
      return null
    }

    return entry.response
  }

  set(pipeId: string, messages: Message[], response: string): void {
    const key = this.generateKey(pipeId, messages)
    this.cache.set(key, {
      response,
      timestamp: Date.now(),
    })
  }

  clear(): void {
    this.cache.clear()
  }
}

