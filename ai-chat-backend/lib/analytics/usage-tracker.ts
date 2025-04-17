import type { ModelType } from "@/lib/types"

interface UsageRecord {
  timestamp: number
  pipeId: string
  modelType: ModelType
  tokensUsed?: number
  processingTime: number
  success: boolean
}

export class UsageTracker {
  private records: UsageRecord[] = []

  trackUsage(record: UsageRecord): void {
    this.records.push(record)

    // In a real application, you might want to persist this data
    // to a database or analytics service
    console.log("Usage tracked:", record)
  }

  getRecentUsage(minutes = 60): UsageRecord[] {
    const cutoff = Date.now() - minutes * 60 * 1000
    return this.records.filter((record) => record.timestamp >= cutoff)
  }

  getUsageByPipe(pipeId: string): UsageRecord[] {
    return this.records.filter((record) => record.pipeId === pipeId)
  }

  getUsageByModel(modelType: ModelType): UsageRecord[] {
    return this.records.filter((record) => record.modelType === modelType)
  }
}

