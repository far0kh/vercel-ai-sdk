"use client"

import { useState, useEffect } from "react"
import { useChat } from "@ai-sdk/react"

export default function Home() {
  const [selectedPipe, setSelectedPipe] = useState("openai-gpt4")
  const [pipes, setPipes] = useState<any[]>([])

  // Fetch available pipes on component mount
  useEffect(() => {
    fetch("/api/pipes")
      .then((res) => res.json())
      .then((data) => setPipes(data.pipes || []))
      .catch((err) => console.error("Failed to fetch pipes:", err))
  }, [])

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      pipeId: selectedPipe,
    },
  })
  console.log("messages", messages);

  return (
    <div className="flex flex-col w-full max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">AI Chat</h1>

      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">Select AI Model:</label>
        <select
          value={selectedPipe}
          onChange={(e) => setSelectedPipe(e.target.value)}
          className="w-full p-2 border rounded"
        >
          {pipes.map((pipe) => (
            <option key={pipe.id} value={pipe.id}>
              {pipe.name} - {pipe.description}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`p-3 rounded-lg ${message.role === "user" ? "bg-blue-100 ml-auto" : "bg-gray-100"} max-w-[80%]`}
          >
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="bg-gray-100 p-3 rounded-lg max-w-[80%]">
            <div className="animate-pulse">Thinking...</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={input}
          onChange={handleInputChange}
          placeholder="Type your message..."
          className="flex-1 p-2 border rounded"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  )
}

