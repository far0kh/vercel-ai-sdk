import type { NextRequest } from "next/server"
import { ChatPipelineManager } from "@/lib/chat/pipeline-manager"

export async function GET(req: NextRequest) {
  try {
    const pipelineManager = new ChatPipelineManager()
    const pipes = await pipelineManager.listPipes()

    return Response.json({ pipes })
  } catch (error) {
    console.error("Pipes API error:", error)
    return Response.json({ error: "Failed to fetch pipes" }, { status: 500 })
  }
}

