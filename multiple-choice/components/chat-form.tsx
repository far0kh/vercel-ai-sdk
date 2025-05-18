"use client"

import { cn } from "@/lib/utils"

import { useChat } from "@ai-sdk/react"

import { ArrowUpIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { AutoResizeTextarea } from "@/components/autoresize-textarea"
import { MultipleChoiceOptions } from "@/components/multiple-choice-options"
import { MultipleChoiceQuestion } from "@/components/multiple-choice-question"

export function ChatForm({ className, ...props }: React.ComponentProps<"form">) {
  const { messages, input, setInput, append } = useChat({
    api: "/api/chat",
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    void append({ content: input, role: "user" })
    setInput("")
  }

  const handleSelectOptions = (option: string) => {
    void append({ content: option, role: "user" })
  }

  const handleSelectAnswer = (answer: string) => {
    void append({ content: answer, role: "user" })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as unknown as React.FormEvent<HTMLFormElement>)
    }
  }

  const header = (
    <header className="m-auto flex max-w-96 flex-col gap-5 text-center">
      <h1 className="text-2xl font-semibold leading-none tracking-tight">Basic AI Chatbot Template</h1>
      <p className="text-muted-foreground text-sm">
        This is an AI chatbot app template built with <span className="text-foreground">Next.js</span>, the{" "}
        <span className="text-foreground">Vercel AI SDK</span>, and <span className="text-foreground">Vercel KV</span>.
      </p>
      <p className="text-muted-foreground text-sm">
        Connect an API Key from your provider and send a message to get started.
      </p>
    </header>
  )

  const _messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          {/* {message.content} */}
          {JSON.stringify(message)}
        </div>
      ))}
    </div>
  )

  const messageList = (
    <div className="my-4 flex h-fit min-h-full flex-col gap-4">
      {messages.map((message, index) => (
        <div
          key={index}
          data-role={message.role}
          className="max-w-[80%] rounded-xl px-3 py-2 text-sm data-[role=assistant]:self-start data-[role=user]:self-end data-[role=assistant]:bg-gray-100 data-[role=user]:bg-blue-500 data-[role=assistant]:text-black data-[role=user]:text-white"
        >
          {message.role === "user" ? (
            // <div className="p-3 rounded-lg bg-muted">
            <p>{message.content}</p>
            // </div>
          ) : message.role === "assistant" ? (
            <div>
              {message.parts?.map((part, index) => {
                const { type } = part;
                const key = `message-${message.id}-part-${index}`;

                if (type === 'tool-invocation') {
                  const { toolInvocation } = part;
                  const { toolName, toolCallId, state } = toolInvocation;

                  // const { args } = toolInvocation;
                  let result = null;
                  if (state === "result") result = toolInvocation.result;
                  // const result = toolInvocation.args;

                  if (toolName === "generateMultipleChoiceOptions" && result) {
                    return (
                      <MultipleChoiceOptions
                        key={key}
                        optionsData={result}
                        onOptionsSelected={(option) => {
                          handleSelectOptions(option)
                        }}
                      />
                    )
                  } else if (toolName === "generateMultipleChoiceQuestion" && result) {
                    return (
                      <MultipleChoiceQuestion
                        key={key}
                        questionData={result}
                        onAnswerSelected={(answer) => {
                          // setInput(answer)
                          // handleSubmit(new Event("submit") as any)
                          handleSelectAnswer(answer)
                        }}
                      // onAnswerSelected={(answerId) => {
                      //   setInput(
                      //     JSON.stringify({
                      //       selectedAnswer: answerId,
                      //       correctAnswer: result.correctAnswer,
                      //       explanation: result.explanation,
                      //     }),
                      //   )
                      //   handleSubmit(new Event("submit") as any)
                      // }}
                      />
                    )
                  } else if (toolName === "checkAnswer" && result) {
                    return (
                      <div key={key} className="p-4 rounded-lg border mt-2">
                        <p
                          className={
                            result.isCorrect ? "text-green-600 font-medium" : "text-red-600 font-medium"
                          }
                        >
                          {result.feedback}
                        </p>
                      </div>
                    )
                  }
                  return null
                }

                if (type === 'text') {
                  return (
                    <p key={key}>{part.text}</p>
                  )
                }
              })}
            </div>
          ) : (
            <div className="p-3 rounded-lg bg-muted">
              <p>{message.content}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )

  return (
    <main
      className={cn(
        "ring-none mx-auto flex h-svh max-h-svh w-full max-w-[35rem] flex-col items-stretch border-none",
        className,
      )}
      {...props}
    >
      <div className="flex-1 content-center overflow-y-auto px-6">{messages.length ? messageList : header}</div>
      <form
        onSubmit={handleSubmit}
        className="border-input bg-background focus-within:ring-ring/10 relative mx-6 mb-6 flex items-center rounded-[16px] border px-3 py-1.5 pr-8 text-sm focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-0"
      >
        <AutoResizeTextarea
          onKeyDown={handleKeyDown}
          onChange={(v) => setInput(v)}
          value={input}
          placeholder="Enter a message"
          className="placeholder:text-muted-foreground flex-1 bg-transparent focus:outline-none"
        />
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="sm" className="absolute bottom-1 right-1 size-6 rounded-full">
              <ArrowUpIcon size={16} />
            </Button>
          </TooltipTrigger>
          <TooltipContent sideOffset={12}>Submit</TooltipContent>
        </Tooltip>
      </form>
    </main>
  )
}
