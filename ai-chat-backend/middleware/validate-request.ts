import { type NextRequest, NextResponse } from "next/server"

export async function validateChatRequest(req: NextRequest, handler: (body: any) => Promise<Response>) {
  try {
    const body = await req.json()

    // Validate required fields
    if (!body.pipeId) {
      return NextResponse.json({ error: "Pipe ID is required" }, { status: 400 })
    }

    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json({ error: "Messages are required and must be an array" }, { status: 400 })
    }

    // Validate message format
    for (const message of body.messages) {
      if (!message.role || !message.content) {
        return NextResponse.json({ error: "Each message must have a role and content" }, { status: 400 })
      }

      if (!["user", "assistant", "system"].includes(message.role)) {
        return NextResponse.json({ error: "Message role must be user, assistant, or system" }, { status: 400 })
      }
    }

    // If validation passes, call the handler with the parsed body
    return handler(body)
  } catch (error) {
    console.error("Request validation error:", error)
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }
}

