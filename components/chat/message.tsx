"use client"

import { useState } from "react"
import { Bot, Copy, User } from "lucide-react"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/components/chat/types"

type MessageProps = {
  message: ChatMessage
}

export function Message({ message }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const isUser = message.role === "user"

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <div className={cn("group flex w-full", isUser ? "justify-end" : "justify-start")}>
      <div className={cn("max-w-[85%] space-y-1", isUser ? "items-end" : "items-start")}>
        <div
          className={cn(
            "rounded-xl px-4 py-3 shadow-sm",
            isUser
              ? "bg-slate-900 text-slate-50"
              : "border bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100"
          )}
        >
          {!isUser ? (
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
                <Bot className="size-3.5" />
                Assistant
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="size-6"
                onClick={handleCopy}
                aria-label="Copy assistant message"
              >
                <Copy className="size-3.5" />
              </Button>
            </div>
          ) : (
            <div className="mb-2 inline-flex items-center gap-2 text-xs text-slate-300">
              <User className="size-3.5" />
              You
            </div>
          )}

          {isUser ? (
            <p className="whitespace-pre-wrap break-words text-sm">{message.content}</p>
          ) : (
            <div className="prose prose-sm max-w-none dark:prose-invert prose-pre:overflow-x-auto prose-pre:rounded-lg prose-pre:p-3">
              <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
                {message.content}
              </ReactMarkdown>
            </div>
          )}

          {copied ? <p className="mt-2 text-xs text-green-500">Copied</p> : null}
        </div>
        <p className="invisible text-xs text-muted-foreground group-hover:visible">
          {new Date(message.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
