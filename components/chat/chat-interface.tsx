"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"

import { Button } from "@/components/ui/button"
import { Message } from "@/components/chat/message"
import type { ChatMessage } from "@/components/chat/types"

type ChatInterfaceProps = {
  sessionId: string | null
  initialMessages: ChatMessage[]
  onSessionCreated: (sessionId: string, title: string) => void
}

type ChatErrorKind = "rate-limit" | "monthly-limit" | "generic"

const suggestedPrompts = [
  "Summarize this week’s goals into a checklist.",
  "Draft a launch announcement for a new SaaS feature.",
  "Give me a growth strategy for my AI startup.",
]

export function ChatInterface({
  sessionId,
  initialMessages,
  onSessionCreated,
}: ChatInterfaceProps) {
  const [chatError, setChatError] = useState<{
    kind: ChatErrorKind
    message: string
  } | null>(null)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)
  const [input, setInput] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const endRef = useRef<HTMLDivElement | null>(null)

  const transformedInitialMessages = useMemo(
    () =>
      initialMessages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: [{ type: "text" as const, text: message.content }],
      })),
    [initialMessages]
  )

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          sessionId: currentSessionId ?? undefined,
        }),
        fetch: async (input, init) => {
          const response = await fetch(input, init)

          if (!response.ok) {
            const payload = await response.clone().json().catch(() => ({}))
            if (response.status === 429) {
              setChatError({
                kind: "rate-limit",
                message: payload.error ?? "Rate limit exceeded.",
              })
            } else if (response.status === 403) {
              setChatError({
                kind: "monthly-limit",
                message: payload.error ?? "Monthly message limit reached.",
              })
            } else {
              setChatError({
                kind: "generic",
                message: payload.error ?? "Something went wrong. Try again.",
              })
            }
            return response
          }

          const returnedSessionId = response.headers.get("x-chat-session-id")
          if (
            returnedSessionId &&
            returnedSessionId !== currentSessionId &&
            pendingTitle
          ) {
            setCurrentSessionId(returnedSessionId)
            onSessionCreated(returnedSessionId, pendingTitle)
            setPendingTitle(null)
          }

          return response
        },
      }),
    [currentSessionId, onSessionCreated, pendingTitle]
  )

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport,
    messages: transformedInitialMessages,
    onError: (error) => {
      const message = error.message || "Unexpected chat error"
      const lowered = message.toLowerCase()
      if (lowered.includes("rate limit")) {
        setChatError({ kind: "rate-limit", message })
        return
      }
      if (lowered.includes("monthly message limit")) {
        setChatError({ kind: "monthly-limit", message })
        return
      }
      setChatError({ kind: "generic", message })
    },
  })

  useEffect(() => {
    setCurrentSessionId(sessionId)
    setMessages(transformedInitialMessages)
  }, [sessionId, setMessages, transformedInitialMessages])

  useEffect(() => {
    if (!error) return
    const lowered = error.message.toLowerCase()
    if (lowered.includes("rate limit")) {
      setChatError({ kind: "rate-limit", message: error.message })
      return
    }
    if (lowered.includes("monthly message limit")) {
      setChatError({ kind: "monthly-limit", message: error.message })
      return
    }
    setChatError({ kind: "generic", message: error.message })
  }, [error])

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, status])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "0px"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 220)}px`
  }, [input])

  const submitMessage = (event: React.FormEvent<HTMLFormElement>) => {
    setChatError(null)
    const cleanInput = input.trim()
    if (!cleanInput) {
      event.preventDefault()
      return
    }

    if (!sessionId) {
      setPendingTitle(cleanInput.slice(0, 50))
    }
    event.preventDefault()
    setInput("")
    void sendMessage(
      { text: cleanInput },
      {
        body: {
          sessionId: currentSessionId ?? undefined,
        },
      }
    )
  }

  const injectPrompt = (prompt: string) => {
    setInput(prompt)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center space-y-6 text-center">
            <div>
              <h2 className="text-2xl font-semibold">Start your first chat</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Ask anything and get a streaming response instantly.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-2">
              {suggestedPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  onClick={() => injectPrompt(prompt)}
                >
                  {prompt}
                </Button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <Message
              key={message.id}
              message={{
                id: message.id,
                role: message.role as "user" | "assistant" | "system",
                content: extractTextFromMessage(message),
                created_at: new Date().toISOString(),
              }}
            />
          ))
        )}

        {status === "submitted" || status === "streaming" ? (
          <div className="inline-flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm text-muted-foreground">
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/80" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/80 [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-muted-foreground/80 [animation-delay:300ms]" />
          </div>
        ) : null}

        {chatError ? (
          <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
            <p className="font-medium text-destructive">{chatError.message}</p>
            {chatError.kind === "rate-limit" || chatError.kind === "monthly-limit" ? (
              <p className="mt-1 text-muted-foreground">
                Need higher limits?{" "}
                <Link href="/pricing" className="font-medium text-foreground underline underline-offset-4">
                  Upgrade your plan
                </Link>
              </p>
            ) : null}
          </div>
        ) : null}

        <div ref={endRef} />
      </div>

      <div className="border-t bg-background p-4">
        <form onSubmit={submitMessage} className="space-y-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(event) => {
              setInput(event.target.value)
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                event.currentTarget.form?.requestSubmit()
              }
            }}
            placeholder="Ask anything..."
            className="max-h-56 min-h-12 w-full resize-none rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Enter to send, Shift+Enter for newline</p>
            <Button
              type="submit"
              disabled={(status === "submitted" || status === "streaming") || input.trim().length === 0}
            >
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function extractTextFromMessage(message: UIMessage) {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: "text"; text: string }> => part.type === "text")
    .map((part) => part.text)
    .join("")
}
