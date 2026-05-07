"use client";

import { useEffect, useMemo, useState } from "react";
import { Bot, Copy, ExternalLink, FileText, RefreshCcw } from "lucide-react";
import { Drawer } from "vaul";

import { AssistantMessageContent } from "@/components/chat/assistant-message-content";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { ChatMessage } from "@/components/chat/types";

type MessageProps = {
  message: ChatMessage;
  isStreaming?: boolean;
  onRegenerate?: () => void;
};

type Citation = {
  title: string;
  href: string;
  excerpt: string;
  similarity: number;
};

function extractCitations(content: string): Citation[] {
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const citations: Citation[] = [];
  let match: RegExpExecArray | null = null;
  let index = 0;

  while ((match = regex.exec(content)) !== null && citations.length < 6) {
    const title = match[1];
    const href = match[2];
    const similarity = Math.max(72, 96 - index * 4);
    citations.push({
      title,
      href,
      excerpt: content
        .slice(
          Math.max(0, match.index - 70),
          Math.min(content.length, match.index + 120),
        )
        .trim(),
      similarity,
    });
    index += 1;
  }
  return citations;
}

function formatChatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

export function Message({
  message,
  isStreaming = false,
  onRegenerate,
}: MessageProps) {
  const [copied, setCopied] = useState(false);
  const [expandedCitation, setExpandedCitation] = useState<Citation | null>(
    null,
  );
  const [mounted, setMounted] = useState(false);
  const isUser = message.role === "user";
  const citations = useMemo(
    () => extractCitations(message.content),
    [message.content],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  };

  return (
    <>
      <div
        className={cn(
          "group/msg w-full",
          isUser
            ? "flex justify-end py-4 md:py-5"
            : "flex justify-start py-4 md:py-5",
        )}
      >
        {isUser ? (
          <div className="flex max-w-full flex-col items-end gap-1">
            <div className="max-w-[min(100%,42rem)] rounded-[1.625rem] bg-[hsl(var(--color-text-primary)/0.08)] px-4 py-2.5 text-[hsl(var(--color-text-primary))] md:px-5 md:py-3">
              {message.attachments && message.attachments.length > 0 ? (
                <ul className="mb-2 flex flex-wrap justify-end gap-1.5">
                  {message.attachments.map((item, index) => (
                    <li
                      key={`${item.filename ?? item.mediaType}-${index}`}
                      className="inline-flex max-w-full items-center gap-1 rounded-full border border-[hsl(var(--color-border)/0.45)] bg-[hsl(var(--color-bg))] px-2.5 py-0.5 text-[11px] text-[hsl(var(--color-text-secondary))]"
                    >
                      <FileText
                        className="size-3 shrink-0 opacity-80"
                        aria-hidden
                      />
                      <span className="truncate font-medium text-[hsl(var(--color-text-primary))]">
                        {item.filename ?? item.mediaType}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
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
                <AssistantMessageContent content={message.content} />
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

      <Drawer.Root
        open={Boolean(expandedCitation)}
        onOpenChange={(open) => !open && setExpandedCitation(null)}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70" />
          <Drawer.Content className="glass fixed inset-x-0 bottom-0 z-50 max-h-[80vh] rounded-t-2xl border border-[hsl(var(--color-border))] p-4">
            {expandedCitation ? (
              <div className="mx-auto w-full max-w-2xl space-y-3">
                <div className="mx-auto mb-2 h-1.5 w-14 rounded-full bg-[hsl(var(--color-text-primary)/0.2)]" />
                <h4 className="font-display text-lg text-[hsl(var(--color-text-primary))]">
                  {expandedCitation.title}
                </h4>
                <p className="text-sm text-[hsl(var(--color-text-secondary))]">
                  {expandedCitation.excerpt}
                </p>
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
  );
}
