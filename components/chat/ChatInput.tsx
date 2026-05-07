"use client";

import { Mic, Paperclip, SendHorizonal, Square, X } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const ACCEPT =
  "image/*,.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

type ChatInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  onSubmit: () => void;
  isStreaming: boolean;
  isDisabled: boolean;
  onStop: () => void;
  onFocusRequest?: (focus: () => void) => void;
  className?: string;
  attachedFiles: File[];
  onAttachedFilesChange: (files: File[]) => void;
};

function estimateTokens(text: string) {
  return Math.max(0, Math.ceil(text.length / 4));
}

export function ChatInput({
  value,
  onValueChange,
  onSubmit,
  isStreaming,
  isDisabled,
  onStop,
  onFocusRequest,
  className,
  attachedFiles,
  onAttachedFilesChange,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const tokenCount = useMemo(
    () => estimateTokens(value),
    [value],
  );

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "0px";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 192)}px`;
  }, [value]);

  useEffect(() => {
    if (!onFocusRequest) return;
    onFocusRequest(() => textareaRef.current?.focus());
  }, [onFocusRequest]);

  const handleSend = () => {
    if (isStreaming) {
      onStop();
      return;
    }
    if ((!value.trim() && attachedFiles.length === 0) || isDisabled) return;
    onSubmit();
  };

  const addFilesFromList = (list: FileList | null) => {
    if (!list?.length) return;
    const maxFiles = 5;
    const maxBytes = 10 * 1024 * 1024;
    const next = [...attachedFiles];
    for (const file of Array.from(list)) {
      if (next.length >= maxFiles) break;
      if (file.size > maxBytes) continue;
      const dup = next.some(
        (f) => f.name === file.name && f.size === file.size,
      );
      if (dup) continue;
      next.push(file);
    }
    onAttachedFilesChange(next);
  };

  return (
    <div className={cn("px-3 pb-5 pt-4", className)}>
      <div className="mx-auto w-full max-w-5xl">
        <div className="rounded-[1.4rem] border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-3 shadow-[0_0_60px_-15px_hsl(var(--color-accent)/0.28)] ring-1 ring-[hsl(var(--color-border)/0.5)] [&_*:focus-visible]:ring-0 [&_*:focus-visible]:ring-transparent [&_*:focus-visible]:border-transparent">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            tabIndex={-1}
            onChange={(event) => {
              addFilesFromList(event.target.files);
              event.target.value = "";
            }}
          />
          {attachedFiles.length > 0 ? (
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              {attachedFiles.map((file, index) => (
                <span
                  key={`${file.name}-${file.size}-${index}`}
                  className="inline-flex max-w-full items-center gap-1 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] py-0.5 pl-2.5 pr-1 text-xs text-[hsl(var(--color-text-secondary))]"
                >
                  <span className="max-w-[200px] truncate font-medium text-[hsl(var(--color-text-primary))]">
                    {file.name}
                  </span>
                  <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() =>
                      onAttachedFilesChange(
                        attachedFiles.filter((_, i) => i !== index),
                      )
                    }
                    className="inline-flex size-6 shrink-0 items-center justify-center rounded-full text-[hsl(var(--color-text-secondary))] transition-colors duration-200 hover:bg-[hsl(var(--color-text-primary)/0.08)] hover:text-[hsl(var(--color-text-primary))] disabled:opacity-50"
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="size-3.5" />
                  </button>
                </span>
              ))}
            </div>
          ) : null}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(event) => onValueChange(event.target.value)}
            onKeyDown={(event) => {
              if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
                event.preventDefault();
                handleSend();
                return;
              }
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                handleSend();
              }
            }}
            disabled={isDisabled}
            placeholder="Ask anything..."
            className="max-h-48 min-h-10 w-full resize-none bg-transparent px-1 py-1 text-sm text-[hsl(var(--color-text-primary))] outline-none placeholder:text-[hsl(var(--color-text-secondary))] disabled:opacity-60"
          />

          <div className="mt-2 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
                disabled={isDisabled}
                aria-label="Attach images, PDF, or Word files"
                title="Attach images, PDF, or Word (max 5 files, 10 MB each)"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="size-4" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="size-8 rounded-full"
              >
                <Mic className="size-4" />
              </Button>
              <motion.button
                type="button"
                onClick={handleSend}
                disabled={
                  !isStreaming &&
                  ((!value.trim() && attachedFiles.length === 0) || isDisabled)
                }
                animate={isStreaming ? { scale: [1, 1.03, 1] } : { scale: 1 }}
                transition={
                  isStreaming
                    ? { duration: 1.4, repeat: Infinity }
                    : { duration: 0.2 }
                }
                className={cn(
                  "inline-flex size-9 cursor-pointer items-center justify-center rounded-full transition-all duration-200",
                  isStreaming
                    ? "border border-[hsl(var(--color-accent)/0.8)] bg-[hsl(var(--color-accent)/0.18)] text-[hsl(var(--color-accent-soft))]"
                    : "bg-[image:var(--gradient-ember)] text-[hsl(var(--color-accent-foreground))] shadow-[0_0_24px_-10px_hsl(var(--color-accent)/0.9)]",
                  !isStreaming &&
                    ((!value.trim() && attachedFiles.length === 0) ||
                      isDisabled)
                    ? "cursor-not-allowed bg-[hsl(var(--color-text-primary)/0.16)] text-[hsl(var(--color-text-secondary))] shadow-none"
                    : "",
                )}
              >
                {isStreaming ? (
                  <Square className="size-3.5" />
                ) : (
                  <SendHorizonal className="size-4" />
                )}
              </motion.button>
            </div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-[hsl(var(--color-text-secondary))]">
          <p>
            Enter to send · Images, PDF, .docx (5×10 MB) · Shift+Enter new line
          </p>
          <p>{tokenCount} / 4096</p>
        </div>
      </div>
    </div>
  );
}
