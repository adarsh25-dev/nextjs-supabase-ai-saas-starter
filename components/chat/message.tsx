"use client"

import { useEffect, useMemo, useState } from "react"
import { Bot, Code2, Copy, ExternalLink, FileText, RefreshCcw } from "lucide-react"
import { Drawer } from "vaul"
import ReactMarkdown from "react-markdown"
import rehypeHighlight from "rehype-highlight"
import remarkGfm from "remark-gfm"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
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

function parseFenceLanguage(className?: string): string | null {
  if (!className) return null
  const token = className.split(/\s+/).find((part) => part.startsWith("language-"))
  if (!token) return null
  const raw = token.slice("language-".length).trim().toLowerCase()
  return raw || null
}

const SHELL_LANGUAGE_LABEL = "Bash"

function codeBlockLanguageLabel(className?: string): string {
  const lang = parseFenceLanguage(className)
  if (!lang) return "Plain text"
  if (lang === "bash" || lang === "sh" || lang === "shell" || lang === "zsh") {
    return SHELL_LANGUAGE_LABEL
  }
  return lang
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

function formatChatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
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
  const [mounted, setMounted] = useState(false)
  const isUser = message.role === "user"
  const citations = useMemo(() => extractCitations(message.content), [message.content])

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      toast.error("Could not copy to clipboard.")
    }
  }

  return (
    <>
      <div
        className={cn(
          "group/msg w-full",
          isUser ? "flex justify-end py-4 md:py-5" : "flex justify-start py-4 md:py-5",
        )}
      >
        {isUser ? (
          <div className="flex max-w-full flex-col items-end gap-1">
            <div className="max-w-[min(100%,42rem)] rounded-[1.625rem] bg-[hsl(var(--color-text-primary)/0.08)] px-4 py-2.5 text-[hsl(var(--color-text-primary))] md:px-5 md:py-3">
              <p className="whitespace-pre-wrap break-words text-[0.9375rem] leading-relaxed">
                {message.content}
              </p>
            </div>
            <p
              className={cn(
                "pr-1 text-[11px] text-[hsl(var(--color-text-secondary))]",
                "opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                "group-hover/msg:opacity-100",
              )}
            >
              {mounted ? formatChatDateTime(message.created_at) : ""}
            </p>
          </div>
        ) : (
          <div className="flex w-full min-w-0 gap-3 md:gap-4">
            <div className="flex shrink-0 flex-col items-center pt-0.5">
              <span
                className={cn(
                  "flex size-8 items-center justify-center rounded-full bg-[hsl(var(--color-text-primary)/0.08)]",
                  "text-[hsl(var(--color-accent-soft))]",
                  isStreaming && "ring-2 ring-[hsl(var(--color-accent)/0.25)]",
                )}
                aria-hidden
              >
                <Bot className="size-[1.125rem]" strokeWidth={1.75} />
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <div
                className={cn(
                  "chat-markdown max-w-none px-0 py-0 text-[hsl(var(--color-text-primary))]",
                  "[&_pre]:m-0 [&_pre]:bg-transparent [&_pre]:p-0",
                  "[&_pre_code.hljs]:bg-transparent",
                )}
              >
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
                      const langLabel = codeBlockLanguageLabel(className)
                      const codeText = extractCodeText(children).replace(/\n$/, "")
                      return (
                        <div
                          className={cn(
                            "chat-code-block my-6 rounded-2xl border border-[hsl(var(--color-border)/0.35)]",
                            "bg-[hsl(var(--color-code-block))] p-4 md:rounded-[1.25rem] md:p-5",
                            "shadow-[0_12px_48px_-20px_hsl(var(--color-accent)/0.14)]",
                          )}
                        >
                          <div className="mb-3 flex items-center justify-between gap-3 md:mb-4">
                            <div className="flex min-w-0 items-center gap-2">
                              <Code2
                                className="size-[1.125rem] shrink-0 text-[hsl(var(--color-text-primary))]"
                                strokeWidth={2}
                                aria-hidden
                              />
                              <span className="truncate font-sans text-[0.9375rem] font-semibold text-[hsl(var(--color-text-primary))]">
                                {langLabel}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className={cn(
                                "size-9 shrink-0 rounded-xl",
                                "text-[hsl(var(--color-text-primary))]",
                                "hover:bg-[hsl(var(--color-text-primary)/0.1)]",
                                "focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-code-block))]",
                              )}
                              aria-label="Copy code"
                              onClick={async () => {
                                try {
                                  await navigator.clipboard.writeText(codeText)
                                  toast.success("Code copied")
                                } catch {
                                  toast.error("Could not copy to clipboard.")
                                }
                              }}
                            >
                              <Copy className="size-4" strokeWidth={2} />
                            </Button>
                          </div>
                          <pre
                            className={cn(
                              "m-0 overflow-x-auto bg-transparent p-0 font-mono text-[0.8125rem] leading-relaxed tracking-normal",
                              "text-[hsl(var(--color-text-primary))] [tab-size:2]",
                              "selection:bg-[hsl(var(--color-accent)/0.22)] selection:text-[hsl(var(--color-text-primary))]",
                              "md:text-[0.84375rem] md:leading-[1.65]",
                              "[&_code.hljs]:!bg-transparent",
                            )}
                          >
                            {children}
                          </pre>
                        </div>
                      )
                    },
                  }}
                >
                  {message.content}
                </ReactMarkdown>
                {isStreaming ? (
                  <span className="mt-2 inline-flex translate-y-[2px] items-center">
                    <span className="h-4 w-[2px] animate-pulse bg-[hsl(var(--color-accent-soft))]" />
                  </span>
                ) : null}
              </div>

              {!isStreaming ? (
                <div className="mt-2 flex flex-wrap items-center gap-0.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]"
                    onClick={handleCopy}
                  >
                    <Copy className="size-3.5" />
                    {copied ? "Copied" : "Copy"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 gap-1.5 px-2 text-xs text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]"
                    disabled={!onRegenerate}
                    onClick={() => onRegenerate?.()}
                  >
                    <RefreshCcw className="size-3.5" />
                    Regenerate
                  </Button>
                </div>
              ) : null}

              {citations.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-[hsl(var(--color-text-secondary))]">
                    Sources
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {citations.map((citation) => (
                      <button
                        key={`${citation.href}-${citation.title}`}
                        type="button"
                        onClick={() => setExpandedCitation(citation)}
                        className={cn(
                          "max-w-full rounded-lg border border-[hsl(var(--color-border))] bg-[hsl(var(--color-surface))] px-3 py-2 text-left",
                          "text-xs text-[hsl(var(--color-text-primary))] transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                          "hover:border-[hsl(var(--color-accent)/0.4)] hover:text-[hsl(var(--color-accent-soft))]",
                        )}
                      >
                        <span className="inline-flex items-center gap-1.5">
                          <FileText className="size-3 shrink-0 text-[hsl(var(--color-text-secondary))]" />
                          <span className="line-clamp-2">{citation.title}</span>
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <p
                className={cn(
                  "mt-1 text-[11px] text-[hsl(var(--color-text-secondary))]",
                  "opacity-0 transition-opacity duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                  "group-hover/msg:opacity-100",
                )}
              >
                {mounted ? formatChatDateTime(message.created_at) : ""}
              </p>
            </div>
          </div>
        )}
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
