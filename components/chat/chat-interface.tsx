"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  Bot,
  CircleAlert,
  PanelLeft,
  Plus,
  Settings2,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { ChatInput } from "@/components/chat/ChatInput";
import { Message } from "@/components/chat/message";
import type { ChatAttachment, ChatMessage } from "@/components/chat/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MagneticButton } from "@/components/ui/primitives/MagneticButton";
import { formatChatTitle } from "@/lib/chat/format-chat-title";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics/events";

type ChatInterfaceProps = {
  sessionId: string | null;
  sessionTitle: string;
  initialMessages: ChatMessage[];
  onSessionCreated: (sessionId: string, title: string) => void;
  onSessionActivity?: (sessionId: string) => void;
  onNewChat: () => void;
  onOpenSessionsMobile: () => void;
};

type ChatErrorKind = "rate-limit" | "monthly-limit" | "generic";

type ChatApiErrorPayload = {
  error?: string;
  message?: string;
};

const suggestedPrompts = [
  "Summarize this week’s goals into a checklist",
  "Draft a launch announcement for a new SaaS feature",
  "Give me a growth strategy for my AI startup",
  "Create a launch plan for my next product update",
];

export function ChatInterface({
  sessionId,
  sessionTitle,
  initialMessages,
  onSessionCreated,
  onSessionActivity,
  onNewChat,
  onOpenSessionsMobile,
}: ChatInterfaceProps) {
  const [chatError, setChatError] = useState<{
    kind: ChatErrorKind;
    message: string;
  } | null>(null);
  const [pendingTitle, setPendingTitle] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(
    sessionId,
  );
  const activitySessionRef = useRef<string | null>(sessionId);
  const [lastSentMessage, setLastSentMessage] = useState<string | null>(null);
  const [visibleMessagesCount, setVisibleMessagesCount] = useState(50);
  const [monthlyLimitDialogOpen, setMonthlyLimitDialogOpen] = useState(false);
  const inputFocusRef = useRef<(() => void) | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const collapseSentinelRef = useRef<HTMLDivElement | null>(null);
  const rateLimitToastFromFetchRef = useRef(false);
  const prefersReducedMotion = useReducedMotion();
  const [scrollPastFirstUser, setScrollPastFirstUser] = useState(false);

  const transformedInitialMessages = useMemo(
    () =>
      initialMessages.map((message) => ({
        id: message.id,
        role: message.role,
        parts: [{ type: "text" as const, text: message.content }],
      })),
    [initialMessages],
  );

  const initialTimestampById = useMemo(
    () =>
      new Map(
        initialMessages.map((message) => [message.id, message.created_at]),
      ),
    [initialMessages],
  );

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({
          sessionId: currentSessionId ?? undefined,
        }),
        fetch: async (input, init) => {
          const response = await fetch(input, init);

          if (!response.ok) {
            const payload = (await response
              .clone()
              .json()
              .catch(() => ({}))) as ChatApiErrorPayload &
              Record<string, unknown>;
            if (response.status === 429) {
              const title =
                typeof payload.error === "string"
                  ? payload.error
                  : "Rate limit exceeded";
              const description =
                typeof payload.message === "string"
                  ? payload.message
                  : typeof payload.error === "string"
                    ? payload.error
                    : "Too many requests. Try again later or upgrade your plan.";
              rateLimitToastFromFetchRef.current = true;
              toast.error(title, {
                description,
                action: {
                  label: "Upgrade Plan",
                  onClick: () => {
                    window.location.href = "/billing";
                  },
                },
              });
              setChatError({
                kind: "rate-limit",
                message: description,
              });
            } else if (response.status === 403) {
              const description =
                typeof payload.message === "string"
                  ? payload.message
                  : typeof payload.error === "string"
                    ? payload.error
                    : "Monthly message limit reached.";
              setChatError({
                kind: "monthly-limit",
                message: description,
              });
            } else {
              setChatError({
                kind: "generic",
                message:
                  typeof payload.error === "string"
                    ? payload.error
                    : "Something went wrong. Try again.",
              });
            }
            return response;
          }

          const returnedSessionId = response.headers.get("x-chat-session-id");
          if (
            returnedSessionId &&
            returnedSessionId !== currentSessionId &&
            pendingTitle
          ) {
            setCurrentSessionId(returnedSessionId);
            onSessionCreated(returnedSessionId, pendingTitle);
            setPendingTitle(null);
          }

          return response;
        },
      }),
    [currentSessionId, onSessionCreated, pendingTitle],
  );

  const { messages, setMessages, sendMessage, status, error } = useChat({
    transport,
    messages: transformedInitialMessages,
    onFinish: () => {
      const sid = activitySessionRef.current;
      if (sid) {
        onSessionActivity?.(sid);
      }
    },
    onError: (error) => {
      const message = error.message || "Unexpected chat error";
      const fromJson = extractChatApiErrorPayload(message);
      if (
        fromJson &&
        typeof fromJson.error === "string" &&
        typeof fromJson.message === "string" &&
        fromJson.error.toLowerCase().includes("rate")
      ) {
        if (!rateLimitToastFromFetchRef.current) {
          toast.error(fromJson.error, {
            description: fromJson.message,
            action: {
              label: "Upgrade Plan",
              onClick: () => {
                window.location.href = "/billing";
              },
            },
          });
        }
        rateLimitToastFromFetchRef.current = false;
        setChatError({ kind: "rate-limit", message: fromJson.message });
        return;
      }
      rateLimitToastFromFetchRef.current = false;
      const lowered = message.toLowerCase();
      if (lowered.includes("rate limit")) {
        setChatError({ kind: "rate-limit", message });
        return;
      }
      if (lowered.includes("monthly message limit")) {
        setChatError({ kind: "monthly-limit", message });
        return;
      }
      setChatError({ kind: "generic", message });
    },
  });

  useEffect(() => {
    setCurrentSessionId(sessionId);
    activitySessionRef.current = sessionId;
    setMessages(transformedInitialMessages);
    setVisibleMessagesCount(50);
    setScrollPastFirstUser(false);
  }, [sessionId, sessionTitle, setMessages, transformedInitialMessages]);

  useEffect(() => {
    activitySessionRef.current = currentSessionId ?? sessionId;
  }, [sessionId, currentSessionId]);

  useEffect(() => {
    if (!error) return;
    const lowered = error.message.toLowerCase();
    if (lowered.includes("rate limit")) {
      setChatError({ kind: "rate-limit", message: error.message });
      return;
    }
    if (lowered.includes("monthly message limit")) {
      setChatError({ kind: "monthly-limit", message: error.message });
      return;
    }
    setChatError({ kind: "generic", message: error.message });
  }, [error]);

  const scrollToTop = () => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  const scrollToBottom = (behavior: ScrollBehavior = "auto") => {
    const container = scrollContainerRef.current;
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior,
      });
      return;
    }
    endRef.current?.scrollIntoView({ behavior });
  };

  useLayoutEffect(() => {
    if (initialMessages.length === 0) return;
    scrollToTop();
  }, [sessionId, initialMessages]);

  useEffect(() => {
    const isGenerating =
      status === "streaming" || status === "submitted";

    if (!isGenerating) return;

    let frameId: number;
    const tick = () => {
      scrollToBottom("auto");
      frameId = window.requestAnimationFrame(tick);
    };
    frameId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(frameId);
    };
  }, [status, messages]);

  useEffect(() => {
    if (chatError?.kind === "monthly-limit") {
      setMonthlyLimitDialogOpen(true);
    }
  }, [chatError]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "l") {
        event.preventDefault();
        onNewChat();
        return;
      }
      if ((event.metaKey || event.ctrlKey) && event.key === "/") {
        event.preventDefault();
        inputFocusRef.current?.();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onNewChat]);

  const submitMessage = () => {
    rateLimitToastFromFetchRef.current = false;
    setChatError(null);
    const cleanInput = input.trim();
    if (!cleanInput && attachedFiles.length === 0) return;

    if (!currentSessionId) {
      const titleSeed =
        cleanInput.slice(0, 50) ||
        attachedFiles[0]?.name.slice(0, 50) ||
        "New chat";
      setPendingTitle(titleSeed);
    }

    setLastSentMessage(
      cleanInput || (attachedFiles.length ? "[Message with attachments]" : ""),
    );
    trackEvent("chat_message_sent", { sessionId: currentSessionId ?? "new" });
    setInput("");
    const dt = new DataTransfer();
    attachedFiles.forEach((file) => dt.items.add(file));
    const filesPayload = attachedFiles.length > 0 ? dt.files : undefined;
    setAttachedFiles([]);
    void sendMessage(
      {
        text:
          cleanInput ||
          (filesPayload?.length ? "Please use the attached file(s)." : ""),
        ...(filesPayload?.length ? { files: filesPayload } : {}),
      },
      {
        body: {
          sessionId: currentSessionId ?? undefined,
        },
      },
    );
  };

  const injectPrompt = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => inputFocusRef.current?.(), 0);
  };

  const retryLastMessage = () => {
    if (!lastSentMessage || status === "submitted" || status === "streaming")
      return;
    rateLimitToastFromFetchRef.current = false;
    setChatError(null);
    void sendMessage(
      { text: lastSentMessage },
      {
        body: {
          sessionId: currentSessionId ?? undefined,
        },
      },
    );
  };

  const handleRegenerate = () => {
    const latestUser = [...messages]
      .reverse()
      .find((message) => message.role === "user");
    if (!latestUser) return;
    const text = extractTextFromMessage(latestUser);
    if (!text) return;
    setLastSentMessage(text);
    void sendMessage(
      { text },
      {
        body: {
          sessionId: currentSessionId ?? undefined,
        },
      },
    );
  };

  const canRegenerate = useMemo(() => {
    if (status === "submitted" || status === "streaming") return false;
    return messages.some(
      (message) =>
        message.role === "user" && Boolean(extractTextFromMessage(message)),
    );
  }, [messages, status]);

  const visibleMessages =
    messages.length > visibleMessagesCount
      ? messages.slice(-visibleMessagesCount)
      : messages;

  const tailOffset =
    messages.length > visibleMessages.length
      ? messages.length - visibleMessages.length
      : 0;

  const globalFirstUserIndex = messages.findIndex((m) => m.role === "user");

  const firstUserRendered =
    globalFirstUserIndex !== -1 && globalFirstUserIndex >= tailOffset;

  const visibleIndexOfFirstUser =
    globalFirstUserIndex === -1 || !firstUserRendered
      ? -1
      : globalFirstUserIndex - tailOffset;

  const displayTitle =
    formatChatTitle(sessionTitle.trim() || "New chat") ||
    sessionTitle.trim() ||
    "New chat";

  const titleCollapsed =
    messages.length > 0 && (!firstUserRendered || scrollPastFirstUser);

  const showCompactNavTitle = messages.length === 0 || titleCollapsed;

  const showCollapsedTitlePill = titleCollapsed && messages.length > 0;

  const titleMotionTransition = prefersReducedMotion
    ? { duration: 0 }
    : { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const };

  const pillChromeTransition = prefersReducedMotion
    ? { duration: 0.22, ease: [0.25, 0.1, 0.25, 1] as const }
    : { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const };

  const updateScrollPastFirstUser = useCallback(() => {
    if (!firstUserRendered) {
      setScrollPastFirstUser(false);
      return;
    }
    const root = scrollContainerRef.current;
    const sentinel = collapseSentinelRef.current;
    if (!root || !sentinel) {
      setScrollPastFirstUser(false);
      return;
    }
    const rootRect = root.getBoundingClientRect();
    const sentinelRect = sentinel.getBoundingClientRect();
    const threshold = rootRect.top + 76;
    setScrollPastFirstUser(sentinelRect.top < threshold);
  }, [firstUserRendered]);

  useEffect(() => {
    const root = scrollContainerRef.current;
    if (!root) return;

    let raf = 0;
    const scheduleUpdate = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(updateScrollPastFirstUser);
    };

    root.addEventListener("scroll", scheduleUpdate, { passive: true });
    const ro = new ResizeObserver(scheduleUpdate);
    ro.observe(root);

    scheduleUpdate();

    return () => {
      root.removeEventListener("scroll", scheduleUpdate);
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [updateScrollPastFirstUser, messages, visibleMessagesCount]);

  useEffect(() => {
    updateScrollPastFirstUser();
  }, [updateScrollPastFirstUser, messages, status]);

  return (
    <div className="relative flex h-full min-h-0 flex-col bg-[hsl(var(--color-bg))]">
      <nav
        className="pointer-events-none absolute inset-x-0 top-0 z-40 pt-[max(0.75rem,env(safe-area-inset-top))]"
        aria-label="Chat controls"
      >
        <div className="pointer-events-auto flex w-full items-start justify-between gap-3 px-3 pb-2 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-1 sm:gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 shrink-0 gap-1.5 px-2 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] lg:hidden"
              onClick={onOpenSessionsMobile}
            >
              <PanelLeft className="size-4" aria-hidden />
              <span className="text-xs font-medium">Chats</span>
            </Button>
            {showCompactNavTitle ? (
              <motion.div
                initial={false}
                animate={{ opacity: 1 }}
                transition={titleMotionTransition}
                className="relative min-w-0 w-fit max-w-[min(100%,18rem)] overflow-visible sm:max-w-[min(100%,28rem)]"
              >
                <AnimatePresence>
                  {showCollapsedTitlePill ? (
                    <motion.div
                      key="nav-title-pill-backdrop"
                      aria-hidden
                      initial={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.78, y: -12 }
                      }
                      animate={
                        prefersReducedMotion
                          ? { opacity: 1 }
                          : { opacity: 1, scale: 1, y: 0 }
                      }
                      exit={
                        prefersReducedMotion
                          ? { opacity: 0 }
                          : { opacity: 0, scale: 0.9, y: -8 }
                      }
                      transition={pillChromeTransition}
                      className="pointer-events-none absolute inset-0 z-0 rounded-full border border-[hsl(var(--color-border)/0.55)] bg-[hsl(var(--color-bg-elevated)/0.42)] shadow-[0_4px_28px_-10px_hsl(var(--color-accent)/0.22)] backdrop-blur-md supports-[backdrop-filter]:bg-[hsl(var(--color-bg-elevated)/0.36)]"
                      style={{
                        transformOrigin: "50% 40%",
                        willChange: "transform, opacity",
                      }}
                    />
                  ) : null}
                </AnimatePresence>
                <motion.div
                  className="relative z-10 flex min-w-0 w-full max-w-full items-center gap-1.5 text-left"
                  animate={{
                    paddingLeft: showCollapsedTitlePill ? 12 : 0,
                    paddingRight: showCollapsedTitlePill ? 12 : 0,
                    paddingTop: showCollapsedTitlePill ? 4 : 2,
                    paddingBottom: showCollapsedTitlePill ? 4 : 2,
                    borderRadius: showCollapsedTitlePill ? 9999 : 8,
                  }}
                  transition={pillChromeTransition}
                >
                  <span className="font-display min-w-0 truncate text-sm font-medium tracking-[-0.04em] text-[hsl(var(--color-text-primary))] sm:text-base">
                    {displayTitle}
                  </span>
                </motion.div>
              </motion.div>
            ) : (
              <div className="min-h-8 min-w-0 flex-1" aria-hidden />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-lg"
              className="text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))]"
              aria-label="New chat"
              title="New chat (⌘L)"
              onClick={onNewChat}
            >
              <Plus className="size-4" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 gap-1.5 px-2 text-[hsl(var(--color-text-secondary))] hover:text-[hsl(var(--color-text-primary))] sm:px-2.5"
                  aria-label="Chat options"
                >
                  <Settings2 className="size-3.5 shrink-0" aria-hidden />
                  <span className="hidden text-xs font-medium sm:inline">
                    Options
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-primary))]"
              >
                <DropdownMenuItem
                  disabled={!canRegenerate}
                  onSelect={() => handleRegenerate()}
                  className="cursor-pointer text-[hsl(var(--color-text-primary))] focus:bg-[hsl(var(--color-bg))] focus:text-[hsl(var(--color-text-primary))] data-[highlighted]:bg-[hsl(var(--color-bg))] data-[highlighted]:text-[hsl(var(--color-text-primary))]"
                >
                  Regenerate last response
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-[hsl(var(--color-text-primary))] focus:bg-[hsl(var(--color-bg))] focus:text-[hsl(var(--color-text-primary))] data-[highlighted]:bg-[hsl(var(--color-bg))] data-[highlighted]:text-[hsl(var(--color-text-primary))]">
                  Export conversation
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-[hsl(var(--color-text-primary))] focus:bg-[hsl(var(--color-bg))] focus:text-[hsl(var(--color-text-primary))] data-[highlighted]:bg-[hsl(var(--color-bg))] data-[highlighted]:text-[hsl(var(--color-text-primary))]">
                  Share
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>

      <div
        ref={scrollContainerRef}
        className="relative z-0 min-h-0 flex-1 overflow-y-auto scroll-pt-16"
      >
        <div className="mx-auto w-full max-w-5xl px-3 pb-52 pt-10 md:px-6 md:pt-11">
          {messages.length > 0 && firstUserRendered ? (
            <motion.div
              initial={false}
              animate={{
                opacity: titleCollapsed ? 0 : 1,
                maxHeight: titleCollapsed ? 0 : 220,
                marginBottom: titleCollapsed ? 0 : 24,
              }}
              transition={titleMotionTransition}
              className="overflow-hidden"
              aria-hidden={titleCollapsed}
            >
              <div className="origin-top pt-1">
                <motion.h1
                  initial={false}
                  animate={{
                    opacity: titleCollapsed ? 0 : 1,
                    scale: titleCollapsed ? 0.97 : 1,
                  }}
                  transition={titleMotionTransition}
                  className="font-display max-w-3xl text-2xl font-medium tracking-[-0.04em] text-[hsl(var(--color-text-primary))] sm:text-3xl md:text-4xl"
                >
                  {displayTitle}
                </motion.h1>
              </div>
            </motion.div>
          ) : null}

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
                    <p className="text-sm text-[hsl(var(--color-text-primary))]">
                      {prompt}
                    </p>
                    <p className="mt-1 text-xs text-[hsl(var(--color-text-secondary))]">
                      Suggestion {index + 1}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col">
              {messages.length > visibleMessagesCount ? (
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() =>
                      setVisibleMessagesCount((count) => count + 30)
                    }
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
                        created_at:
                          initialTimestampById.get(message.id) ??
                          new Date().toISOString(),
                        attachments: extractAttachmentsFromUiMessage(message),
                      }}
                      isStreaming={
                        status === "streaming" &&
                        index === visibleMessages.length - 1 &&
                        message.role === "assistant"
                      }
                      onRegenerate={handleRegenerate}
                    />
                    {visibleIndexOfFirstUser !== -1 &&
                    index === visibleIndexOfFirstUser ? (
                      <div
                        ref={collapseSentinelRef}
                        className="pointer-events-none h-px w-full shrink-0"
                        aria-hidden
                      />
                    ) : null}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {status === "submitted" ? (
            <div className="flex w-full gap-3 py-4 md:gap-4 md:py-5">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[hsl(var(--color-text-primary)/0.08)] text-[hsl(var(--color-accent-soft))]"
                aria-hidden
              >
                <Bot className="size-[1.125rem]" strokeWidth={1.75} />
              </div>
              <div className="flex items-center gap-2 pt-1.5 text-sm text-[hsl(var(--color-text-secondary))]">
                <TypingDots />
                <span>Thinking…</span>
              </div>
            </div>
          ) : null}

          {chatError ? (
            <div
              className={cn(
                "mt-6 rounded-xl border p-4 text-sm",
                chatError.kind === "generic"
                  ? "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]"
                  : "border-rose-500/35 bg-rose-500/10 shadow-[0_0_30px_-12px_rgba(244,63,94,0.55)]",
              )}
            >
              <div className="flex items-start gap-2">
                <CircleAlert className="mt-0.5 size-4 text-rose-300" />
                <div>
                  <p className="font-medium text-[hsl(var(--color-text-primary))]">
                    {chatError.message}
                  </p>
                  {chatError.kind === "rate-limit" ? (
                    <div className="mt-2 space-y-2">
                      <p className="text-[hsl(var(--color-text-secondary))]">
                        You&apos;ve hit your daily limit. Upgrade to send more
                        messages.
                      </p>
                      <MagneticButton
                        onClick={() => (window.location.href = "/billing")}
                      >
                        Upgrade plan
                      </MagneticButton>
                    </div>
                  ) : null}
                  {chatError.kind === "monthly-limit" ? (
                    <p className="mt-2 text-[hsl(var(--color-text-secondary))]">
                      Monthly message limit reached.
                    </p>
                  ) : null}
                  {chatError.kind === "generic" && lastSentMessage ? (
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={retryLastMessage}
                      >
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

      <div className="pointer-events-none absolute bottom-0 left-0 right-[var(--scrollbar-size)] z-30">
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-0 h-52 bg-gradient-to-t from-[hsl(var(--color-bg))] via-[hsl(var(--color-bg)/0.96)] via-65% to-transparent"
          aria-hidden
        />
        {chatError?.kind === "monthly-limit" ? (
          <div className="absolute inset-0 z-10 rounded-2xl bg-black/45 backdrop-blur-[1px]" />
        ) : null}
        <div className="relative z-20">
          <ChatInput
            value={input}
            onValueChange={setInput}
            onSubmit={submitMessage}
            isStreaming={status === "streaming" || status === "submitted"}
            isDisabled={chatError?.kind === "monthly-limit"}
            onStop={() => undefined}
            attachedFiles={attachedFiles}
            onAttachedFilesChange={setAttachedFiles}
            onFocusRequest={(focus) => {
              inputFocusRef.current = focus;
            }}
            className="pointer-events-auto pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-6"
          />
        </div>
      </div>

      <Dialog
        open={monthlyLimitDialogOpen}
        onOpenChange={setMonthlyLimitDialogOpen}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-xl text-[hsl(var(--color-text-primary))]">
              Monthly limit reached
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--color-text-secondary))]">
              You&apos;ve used your monthly message quota. Upgrade your plan to
              continue chatting.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 flex items-center gap-2">
            <MagneticButton onClick={() => (window.location.href = "/billing")}>
              Upgrade plan
            </MagneticButton>
            <Button
              variant="ghost"
              onClick={() => setMonthlyLimitDialogOpen(false)}
            >
              Maybe later
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function tryParseChatApiJson(text: string): ChatApiErrorPayload | null {
  const trimmed = text.trim();
  if (!trimmed.startsWith("{")) return null;
  try {
    const parsed: unknown = JSON.parse(trimmed);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as ChatApiErrorPayload;
  } catch {
    return null;
  }
}

function extractChatApiErrorPayload(text: string): ChatApiErrorPayload | null {
  const direct = tryParseChatApiJson(text);
  if (direct) return direct;
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return null;
  return tryParseChatApiJson(text.slice(start, end + 1));
}

function extractTextFromMessage(message: UIMessage) {
  return message.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text"; text: string }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("");
}

function extractAttachmentsFromUiMessage(
  message: UIMessage,
): ChatAttachment[] | undefined {
  const files = message.parts.filter(
    (part): part is Extract<typeof part, { type: "file" }> =>
      part.type === "file",
  );
  if (files.length === 0) return undefined;
  return files.map((part) => ({
    filename: part.filename,
    mediaType: part.mediaType,
  }));
}

function TypingDots() {
  const dots = [0, 1, 2];
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
  );
}
