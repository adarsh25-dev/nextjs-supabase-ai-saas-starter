"use client"

import Link from "next/link"
import { useEffect, useMemo, useRef, useState } from "react"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"
import { AnimatePresence, motion } from "framer-motion"
import { Bot, CircleAlert, Settings2, Sparkles } from "lucide-react"

import { ChatInput } from "@/components/chat/ChatInput"
import { Message } from "@/components/chat/message"
import type { ChatMessage } from "@/components/chat/types"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { cn } from "@/lib/utils"
import { trackEvent } from "@/lib/analytics/events"

type ChatInterfaceProps = {
  sessionId: string | null
  sessionTitle: string
  initialMessages: ChatMessage[]
  onSessionCreated: (sessionId: string, title: string) => void
  onNewChat: () => void
  onOpenSessionsMobile: () => void
  onRenameSession: (sessionId: string, title: string) => Promise<void>
}

type ChatErrorKind = "rate-limit" | "monthly-limit" | "generic"

const suggestedPrompts = [
  "Summarize this week’s goals into a checklist",
  "Draft a launch announcement for a new SaaS feature",
  "Give me a growth strategy for my AI startup",
  "Create a launch plan for my next product update",
]

export function ChatInterface({
  sessionId,
  sessionTitle,
  initialMessages,
  onSessionCreated,
  onNewChat,
  onOpenSessionsMobile,
  onRenameSession,
}: ChatInterfaceProps) {
  const [chatError, setChatError] = useState<{
    kind: ChatErrorKind
    message: string
  } | null>(null)
  const [pendingTitle, setPendingTitle] = useState<string | null>(null)
  const [editableTitle, setEditableTitle] = useState(sessionTitle)
  const [isTitleEditing, setIsTitleEditing] = useState(false)
  const [input, setInput] = useState("")
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(sessionId)
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null)
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(50)
  const [monthlyLimitDialogOpen, setMonthlyLimitDialogOpen] = useState(false)
  const inputFocusRef = useRef<(() => void) | null>(null)
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

  const initialTimestampById = useMemo(
    () => new Map(initialMessages.map((message) => [message.id, message.created_at])),
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
          if (returnedSessionId && returnedSessionId !== currentSessionId && pendingTitle) {
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
    setEditableTitle(sessionTitle)
    setVisibleMessagesCount(50)
  }, [sessionId, sessionTitle, setMessages, transformedInitialMessages])

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
    if (chatError?.kind === "monthly-limit") {
      setMonthlyLimitDialogOpen(true)
    }
  }, [chatError])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") {
        event.preventDefault()
        onNewChat()
        return
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault()
        inputFocusRef.current?.()
      }
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [onNewChat])

  const submitMessage = () => {
    setChatError(null)
    const cleanInput = input.trim()
    if (!cleanInput) return

    if (!currentSessionId) {
      setPendingTitle(cleanInput.slice(0, 50))
    }

    setLastSentMessage(cleanInput)
    trackEvent("chat_message_sent", { sessionId: currentSessionId ?? "new" })
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
    setTimeout(() => inputFocusRef.current?.(), 0)
  }

  const retryLastMessage = () => {
    if (!lastSentMessage || status === "submitted" || status === "streaming") return
    setChatError(null)
    void sendMessage(
      { text: lastSentMessage },
      {
        body: {
          sessionId: currentSessionId ?? undefined,
        },
      }
    )
  }

  const handleRegenerate = () => {
    const latestUser = [...messages].reverse().find((message) => message.role === "user")
    if (!latestUser) return
    const text = extractTextFromMessage(latestUser)
    if (!text) return
    setLastSentMessage(text)
    void sendMessage(
      { text },
      {
        body: {
          sessionId: currentSessionId ?? undefined,
        },
      }
    )
  }

  const visibleMessages =
    messages.length > visibleMessagesCount ? messages.slice(-visibleMessagesCount) : messages

  const commitTitleRename = async () => {
    if (!currentSessionId) {
      setIsTitleEditing(false)
      return
    }
    const title = editableTitle.trim() || "New chat"
    await onRenameSession(currentSessionId, title)
    setIsTitleEditing(false)
  }

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[hsl(var(--color-border))] px-4 py-3">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="glass rounded-lg border border-[hsl(var(--color-border))] px-2 py-1 text-xs text-[hsl(var(--color-text-secondary))] lg:hidden"
              onClick={onOpenSessionsMobile}
            >
              Sessions
            </button>
            {isTitleEditing ? (
              <input
                value={editableTitle}
                onChange={(event) => setEditableTitle(event.target.value)}
                onBlur={() => void commitTitleRename()}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault()
                    void commitTitleRename()
                  }
                }}
                className="w-56 rounded-md border border-[hsl(var(--color-border))] bg-transparent px-2 py-1 text-sm text-[hsl(var(--color-text-primary))] outline-none"
                autoFocus
              />
            ) : (
              <button
                type="button"
                onClick={() => setIsTitleEditing(true)}
                className="font-display text-sm text-[hsl(var(--color-text-primary))] hover:text-[hsl(var(--color-accent-soft))]"
              >
                {editableTitle || "New chat"}
              </button>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger className="glass inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--color-border))] px-2.5 py-1.5 text-xs text-[hsl(var(--color-text-secondary))]">
              <Settings2 className="size-3.5" />
              Settings
            </DropdownMenuTrigger>
            <DropdownMenuContent className="glass border border-[hsl(var(--color-border))]" align="end">
              <DropdownMenuItem>Model: GPT-4o mini</DropdownMenuItem>
              <DropdownMenuItem onClick={handleRegenerate}>Regenerate last response</DropdownMenuItem>
              <DropdownMenuItem>Export conversation</DropdownMenuItem>
              <DropdownMenuItem>Share</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-4 py-8">
          {messages.length === 0 ? (
            <div className="flex min-h-[52vh] flex-col items-center justify-center space-y-6 text-center">
              <div>
                <div className="mx-auto mb-3 inline-flex size-14 items-center justify-center rounded-2xl bg-[hsl(var(--color-accent)/0.18)] text-[hsl(var(--color-accent-soft))] shadow-[0_0_35px_-12px_hsl(var(--color-accent)/0.7)]">
                  <Bot className="size-7" />
                </div>
                <h2 className="font-display text-3xl text-[hsl(var(--color-text-primary))]">
                  What can I help with?
                </h2>
                <p className="mt-2 text-sm text-[hsl(var(--color-text-secondary))]">
                  Ask anything and get a streaming response instantly.
                </p>
              </div>
              <div className="grid w-full gap-3 sm:grid-cols-2">
                {suggestedPrompts.map((prompt, index) => (
                  <button
                    key={prompt}
                    className="gradient-border rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[hsl(var(--color-accent)/0.65)]"
                    onClick={() => injectPrompt(prompt)}
                  >
                    <Sparkles className="mb-2 size-4 text-[hsl(var(--color-accent-soft))]" />
                    <p className="text-sm text-[hsl(var(--color-text-primary))]">{prompt}</p>
                    <p className="mt-1 text-xs text-[hsl(var(--color-text-secondary))]">Suggestion {index + 1}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {messages.length > visibleMessagesCount ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => setVisibleMessagesCount((count) => count + 30)}
                    className="rounded-full border border-[hsl(var(--color-border))] px-3 py-1 text-xs text-[hsl(var(--color-text-secondary))]"
                  >
                    Load older messages
                  </button>
                </div>
              ) : null}

              <AnimatePresence initial={false}>
                {visibleMessages.map((message, index) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <Message
                      message={{
                        id: message.id,
                        role: message.role as "user" | "assistant" | "system",
                        content: extractTextFromMessage(message),
                        created_at: initialTimestampById.get(message.id) ?? new Date().toISOString(),
                      }}
                      isStreaming={
                        status === "streaming" && index === visibleMessages.length - 1 && message.role === "assistant"
                      }
                      onRegenerate={handleRegenerate}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {status === "submitted" ? (
            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] px-3 py-2 text-xs text-[hsl(var(--color-text-secondary))]">
              <TypingDots />
              Thinking...
            </div>
          ) : null}

          {chatError ? (
            <div
              className={cn(
                "mt-6 rounded-xl border p-4 text-sm",
                chatError.kind === "generic"
                  ? "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]"
                  : "border-rose-500/35 bg-rose-500/10 shadow-[0_0_30px_-12px_rgba(244,63,94,0.55)]"
              )}
            >
              <div className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 text-rose-300" />
                <div>
                  <p className="font-medium text-[hsl(var(--color-text-primary))]">{chatError.message}</p>
                  {chatError.kind === "rate-limit" ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-[hsl(var(--color-text-secondary))]">
                        You&apos;ve hit your daily limit. Upgrade to send more messages.
                      </p>
                      <MagneticButton onClick={() => (window.location.href = "/pricing")}>Upgrade plan</MagneticButton>
                    </div>
                  ) : null}
                  {chatError.kind === "monthly-limit" ? (
                    <p className="mt-2 text-[hsl(var(--color-text-secondary))]">
                      Monthly message limit reached.
                    </p>
                  ) : null}
                  {chatError.kind === "generic" && lastSentMessage ? (
                    <div className="mt-3">
                      <Button type="button" variant="outline" size="sm" onClick={retryLastMessage}>
                        Retry last message
                      </Button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}

          <div ref={endRef} />
        </div>
      </div>

      <div className="relative">
        {chatError?.kind === "monthly-limit" ? (
          <div className="absolute inset-0 z-10 rounded-2xl bg-black/45 backdrop-blur-[1px]" />
        ) : null}
        <ChatInput
          value={input}
          onValueChange={setInput}
          onSubmit={submitMessage}
          isStreaming={status === "streaming" || status === "submitted"}
          isDisabled={chatError?.kind === "monthly-limit"}
          onStop={() => undefined}
          onFocusRequest={(focus) => {
            inputFocusRef.current = focus
          }}
        />
      </div>

      <Dialog open={monthlyLimitDialogOpen} onOpenChange={setMonthlyLimitDialogOpen}>
        <DialogContent className="glass border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[hsl(var(--color-text-primary))]">
              Monthly limit reached
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--color-text-secondary))]">
              You&apos;ve used your monthly message quota. Upgrade your plan to continue chatting.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex items-center gap-2">
            <MagneticButton onClick={() => (window.location.href = "/pricing")}>Upgrade plan</MagneticButton>
            <Button variant="ghost" onClick={() => setMonthlyLimitDialogOpen(false)}>
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function extractTextFromMessage(message: UIMessage) {
  return message.parts
    .filter((part): part is Extract<typeof part, { type: "text"; text: string }> => part.type === "text")
    .map((part) => part.text)
    .join("")
}

function TypingDots() {
  const dots = [0, 1, 2]
  return (
    <span className="inline-flex items-center gap-1">
      {dots.map((dot) => (
        <motion.span
          key={dot}
          className="size-1.5 rounded-full bg-[hsl(var(--color-text-secondary))]"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -2, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: dot * 0.12 }}
        />
      ))}
    </span>
  )
}
