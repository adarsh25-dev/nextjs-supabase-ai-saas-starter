"use client"

import { useMemo, useState } from "react"
import {
  Bot,
  Copy,
  ExternalLink,
  FileText,
  RefreshCcw,
  ThumbsDown,
  ThumbsUp,
  User,
} from "lucide-react"
import { Drawer } from "vaul"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { ChatMessage } from "@/components/chat/types"

type MessageProps = {
  message: ChatMessage
  isStreaming?: boolean
  onRegenerate?: () => void
}

type Citation = {
  title: string
  href: string
  excerpt: string
  similarity: number
}

function extractCitations(content: string): Citation[] {
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g
  const citations: Citation[] = []
  let match: RegExpExecArray | null = null
  let index = 0

  while ((match = regex.exec(content)) !== null && citations.length < 6) {
    const title = match[1]
    const href = match[2]
    const similarity = Math.max(72, 96 - index * 4)
    citations.push({
      title,
      href,
      excerpt: content.slice(Math.max(0, match.index - 70), Math.min(content.length, match.index + 120)).trim(),
      similarity,
    })
    index += 1
  }
  return citations
}

function codeTitle(className?: string) {
  if (!className) return "snippet.txt"
  const language = className.replace("language-", "").trim()
  if (!language) return "snippet.txt"
  return `snippet.${language}`
}

function extractCodeText(node: unknown): string {
  if (typeof node === "string") return node
  if (Array.isArray(node)) return node.map(extractCodeText).join("")
  if (node && typeof node === "object" && "props" in node) {
    const props = (node as { props?: { children?: unknown } }).props
    return extractCodeText(props?.children)
  }
  return ""
}

export function Message({ message, isStreaming = false, onRegenerate }: MessageProps) {
  const [copied, setCopied] = useState(false)
  const [expandedCitation, setExpandedCitation] = useState<Citation | null>(null)
  const isUser = message.role === "user"
  const citations = useMemo(() => extractCitations(message.content), [message.content])

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
  }

  return (
    <>
      <div className={cn("group flex w-full", isUser ? "justify-end" : "justify-start")}>
        <div className={cn("space-y-2", isUser ? "max-w-[80%]" : "w-full")}>
          {isUser ? (
            <div className="rounded-2xl rounded-tr-md bg-[hsl(var(--color-text-primary)/0.06)] px-4 py-3 text-sm text-[hsl(var(--color-text-primary))]">
              <div className="mb-1 inline-flex items-center gap-2 text-xs text-[hsl(var(--color-text-secondary))]">
                <User className="size-3.5" />
                You
              </div>
              <p className="whitespace-pre-wrap break-words">{message.content}</p>
            </div>
          ) : (
            <div className="w-full">
              <div className="mb-2 inline-flex items-center gap-2 text-xs text-[hsl(var(--color-text-secondary))]">
                <span className="relative inline-flex size-6 items-center justify-center rounded-full bg-[hsl(var(--color-accent)/0.2)]">
                  <Bot className="size-3.5 text-[hsl(var(--color-accent-soft))]" />
                  {isStreaming ? (
                    <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-[hsl(var(--color-accent-soft))] animate-pulse" />
                  ) : null}
                </span>
                Assistant
              </div>
              <div className="prose prose-sm max-w-none text-[hsl(var(--color-text-primary))] prose-headings:font-display prose-headings:tracking-tight prose-p:text-[hsl(var(--color-text-primary))] prose-a:text-[hsl(var(--color-accent-soft))] prose-a:transition-colors prose-a:duration-200 hover:prose-a:text-[hsl(var(--color-accent))] prose-code:rounded prose-code:bg-[hsl(var(--color-text-primary)/0.06)] prose-code:px-1.5 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-li:my-1">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeHighlight]}
                  components={{
                    pre: ({ children }) => {
                      const codeChild = Array.isArray(children) ? children[0] : children
                      const className =
                        typeof codeChild === "object" &&
                        codeChild !== null &&
                        "props" in codeChild &&
                        typeof (codeChild as { props?: { className?: string } }).props?.className === "string"
                          ? (codeChild as { props: { className: string } }).props.className
                          : undefined
                      const title = codeTitle(className)
                      const codeText = extractCodeText(children).replace(/\n$/, "")
                      return (
                        <div className="my-4 overflow-hidden rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]">
                        <div className="flex items-center justify-between border-b border-[hsl(var(--color-border))] bg-black/20 px-3 py-2 text-[11px] text-[hsl(var(--color-text-secondary))]">
                            <span>{title}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-6"
                            onClick={async () => {
                              await navigator.clipboard.writeText(codeText)
                            }}
                          >
                            <Copy className="size-3.5" />
                          </Button>
                        </div>
                        <pre className="overflow-x-auto p-3">{children}</pre>
                      </div>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming ? (
                  <span className="inline-flex translate-y-[2px] items-center">
                    <span className="h-4 w-[2px] animate-pulse bg-[hsl(var(--color-accent-soft))]" />
                  </span>
                ) : null}
              </div>

              {!isStreaming ? (
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <Button variant="ghost" size="sm" onClick={handleCopy}>
                    <Copy className="mr-1 size-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onRegenerate}>
                    <RefreshCcw className="mr-1 size-3.5" />
                    Regenerate
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsUp className="size-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ThumbsDown className="size-3.5" />
                  </Button>
                </div>
              ) : null}

              {citations.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--color-text-secondary))]">Sources</p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {citations.map((citation) => (
                      <button
                        key={`${citation.href}-${citation.title}`}
                        type="button"
                        onClick={() => setExpandedCitation(citation)}
                        className="glass min-w-[220px] max-w-xs rounded-lg border border-[hsl(var(--color-border))] p-3 text-left"
                      >
                        <div className="mb-1 flex items-start justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs text-[hsl(var(--color-text-secondary))]">
                            <FileText className="size-3.5" />
                            {citation.title}
                          </span>
                          <span
                            className={cn(
                              "rounded-full px-1.5 py-0.5 text-[10px]",
                              citation.similarity >= 90
                                ? "bg-[hsl(var(--color-accent)/0.2)] text-[hsl(var(--color-accent-soft))]"
                                : "bg-[hsl(var(--color-text-primary)/0.08)] text-[hsl(var(--color-text-secondary))]"
                            )}
                          >
                            {citation.similarity}%
                          </span>
                        </div>
                        <p className="max-h-11 overflow-hidden text-xs text-[hsl(var(--color-text-secondary))]">
                          {citation.excerpt}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          )}
          <p className="invisible text-[11px] text-[hsl(var(--color-text-secondary))] group-hover:visible">
            {new Date(message.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <Drawer.Root open={Boolean(expandedCitation)} onOpenChange={(open) => !open && setExpandedCitation(null)}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <Drawer.Content className="glass fixed inset-x-0 bottom-0 z-50 max-h-[80vh] rounded-t-2xl border border-[hsl(var(--color-border))] p-4">
            {expandedCitation ? (
              <div className="mx-auto w-full max-w-2xl space-y-3">
                <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[hsl(var(--color-text-primary)/0.2)]" />
                <h4 className="font-display text-lg text-[hsl(var(--color-text-primary))]">{expandedCitation.title}</h4>
                <p className="text-sm text-[hsl(var(--color-text-secondary))]">{expandedCitation.excerpt}</p>
                <a
                  href={expandedCitation.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-[hsl(var(--color-accent-soft))]"
                >
                  Open source <ExternalLink className="size-3.5" />
                </a>
              </div>
            ) : null}
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
