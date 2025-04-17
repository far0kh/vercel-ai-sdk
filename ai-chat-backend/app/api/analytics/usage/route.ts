import type { NextRequest } from "next/server"
import { UsageTracker } from "@/lib/analytics/usage-tracker"
import type { ModelType } from "@/lib/types"

const usageTracker = new UsageTracker()

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams
    const timeframe = Number.parseInt(searchParams.get("minutes") || "60")
    const pipeId = searchParams.get("pipeId")
    const modelType = searchParams.get("modelType") as ModelType | null

    let usage

    if (pipeId) {
      usage = usageTracker.getUsageByPipe(pipeId)
    } else if (modelType) {
      usage = usageTracker.getUsageByModel(modelType)
    } else {
      usage = usageTracker.getRecentUsage(timeframe)
    }

    return Response.json({ usage })
  } catch (error) {
    console.error("Usage API error:", error)
    return Response.json({ error: "Failed to fetch usage data" }, { status: 500 })
  }
}

