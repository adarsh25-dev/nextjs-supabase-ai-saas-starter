"use client"

import { Mic, Paperclip, SendHorizonal, Square } from "lucide-react"
import { motion } from "framer-motion"
import { useEffect, useMemo, useRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type ChatInputProps = {
  value: string
  onValueChange: (value: string) => void
  onSubmit: () => void
  isStreaming: boolean
  isDisabled: boolean
  onStop: () => void
  onFocusRequest?: (focus: () => void) => void
}

function estimateTokens(text: string) {
  return Math.max(0, Math.ceil(text.length / 4))
}

export function ChatInput({
  value,
  onValueChange,
  onSubmit,
  isStreaming,
  isDisabled,
  onStop,
  onFocusRequest,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const tokenCount = useMemo(() => estimateTokens(value), [value])

  useEffect(() => {
    if (!textareaRef.current) return
    textareaRef.current.style.height = "0px"
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`
  }, [value])

  useEffect(() => {
    if (!onFocusRequest) return
    onFocusRequest(() => textareaRef.current?.focus())
  }, [onFocusRequest])

  const handleSend = () => {
    if (isStreaming) {
      onStop()
      return
    }
    if (!value.trim() || isDisabled) return
    onSubmit()
  }

  return (
    <div className="sticky bottom-0 border-t border-[hsl(var(--color-border))] bg-black/30 px-3 pb-6 pt-4 backdrop-blur">
      <div className="mx-auto w-full max-w-3xl">
        <div className="gradient-border rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault()
                handleSend()
                return
              }
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault()
                handleSend()
              }
            }}
            disabled={isDisabled}
            placeholder="Ask anything..."
            className="max-h-48 min-h-10 w-full resize-none bg-transparent px-1 py-1 text-sm text-[hsl(var(--color-text-primary))] outline-none placeholder:text-[hsl(var(--color-text-secondary))] disabled:opacity-60"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full">
                <Paperclip className="size-4" />
              </Button>
              <span className="rounded-full border border-[hsl(var(--color-border))] bg-black/25 px-3 py-1 text-xs text-[hsl(var(--color-text-secondary))]">
                GPT-4o mini
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="icon" className="size-8 rounded-full">
                <Mic className="size-4" />
              </Button>
              <motion.button
                type="button"
                onClick={handleSend}
                disabled={!isStreaming && (!value.trim() || isDisabled)}
                animate={isStreaming ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={isStreaming ? { duration: 1.4, repeat: Infinity } : { duration: 0.2 }}
                className={cn(
                  "inline-flex size-9 items-center justify-center rounded-full transition-all duration-200",
                  isStreaming
                    ? "border border-[hsl(var(--color-accent)/0.8)] bg-[hsl(var(--color-accent)/0.18)] text-[hsl(var(--color-accent-soft))]"
                    : "bg-[image:var(--gradient-ember)] text-[hsl(var(--color-accent-foreground))] shadow-[0_0_24px_-10px_hsl(var(--color-accent)/0.9)]",
                  !isStreaming && (!value.trim() || isDisabled)
                    ? "cursor-not-allowed bg-[hsl(var(--color-text-primary)/0.16)] text-[hsl(var(--color-text-secondary))] shadow-none"
                    : ""
                )}
              >
                {isStreaming ? <Square className="size-3.5" /> : <SendHorizonal className="size-4" />}
              </motion.button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[hsl(var(--color-text-secondary))]">
          <p>Press Enter to send, Shift+Enter for new line</p>
          <p>{tokenCount} / 4096</p>
        </div>
      </div>
    </div>
  )
}
