import * as Sentry from "@sentry/nextjs";
import { createOpenAI } from "@ai-sdk/openai";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import mammoth from "mammoth";
import { randomUUID } from "crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { formatChatTitle } from "@/lib/chat/format-chat-title";
import { createClient } from "@/lib/supabase/server";
import { getRateLimitForUser } from "@/lib/ratelimit";
import {
  CHAT_MAX_OUTPUT_TOKENS,
  PLAN_LIMITS,
  type PlanTier,
} from "@/lib/stripe/config";

const chatBodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  messages: z.array(z.any()).min(1),
});

const nvidia = createOpenAI({
  apiKey: process.env.NVIDIA_API_KEY ?? "nvidia-placeholder",
  baseURL: process.env.NVIDIA_BASE_URL ?? "https://integrate.api.nvidia.com/v1",
});

const NVIDIA_MODEL_DEFAULT =
  process.env.NVIDIA_MODEL_DEFAULT ?? "google/gemma-4-31b-it";
const NVIDIA_MODEL_PRO = process.env.NVIDIA_MODEL_PRO ?? "google/gemma-4-31b-it";

const MAX_EXTRACTED_DOC_CHARS = 24_000;

const GEMMA_CHAT_SYSTEM_PROMPT = `You are an elite Next.js and Supabase full-stack architect embedded inside a premium developer SaaS product.

You are powered by Google's Gemma 4. When asked what model you are, who powers you, or similar, answer clearly that you run on Gemma 4.

Be brutally concise. Prefer tight bullets and minimal prose. When code is required, ship highly optimized TypeScript and React for Next.js 14 App Router: strict types, early returns, Zod for validation, Supabase typed-client patterns, and RLS-aware data access. No filler, no apologies for brevity.`;

export async function POST(request: Request) {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return NextResponse.json(
        { error: "Supabase env vars are not configured." },
        { status: 500 },
      );
    }

    if (!process.env.NVIDIA_API_KEY) {
      return NextResponse.json(
        { error: "NVIDIA_API_KEY is not configured." },
        { status: 500 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = chatBodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const rawUiMessages = parsed.data.messages
      .map(normalizeToUiMessage)
      .filter((message): message is UIMessage => Boolean(message));

    if (rawUiMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 },
      );
    }

    const lastRawUser = [...rawUiMessages]
      .reverse()
      .find((message) => message.role === "user");
    if (!lastRawUser || !userMessageHasPayload(lastRawUser)) {
      return NextResponse.json(
        { error: "No valid user message" },
        { status: 400 },
      );
    }

    const expandedMessages = await expandUserFilePartsInMessages(rawUiMessages);

    const latestExpandedUser = [...expandedMessages]
      .reverse()
      .find((message) => message.role === "user");
    if (!latestExpandedUser) {
      return NextResponse.json(
        { error: "No user message found" },
        { status: 400 },
      );
    }

    const now = new Date();
    const monthYear = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan_tier, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (subscriptionError) {
      Sentry.captureException(subscriptionError);
    }

    const planTier: PlanTier | "free" =
      subscription &&
      (subscription.status === "active" || subscription.status === "trialing")
        ? subscription.plan_tier
        : "free";

    const rate = await getRateLimitForUser(user.id, planTier);
    if (!rate.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded",
          message: rateLimitUpgradeMessage(planTier),
          tier: planTier,
          limit: rate.limit,
          remaining: rate.remaining,
          upgradeUrl: "/billing",
        },
        { status: 429 },
      );
    }

    const { count: monthlyMessagesCount, error: usageCountError } = await supabase
      .from("usage_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "chat_message")
      .eq("month_year", monthYear);

    if (usageCountError) {
      throw usageCountError;
    }

    const limit = PLAN_LIMITS[planTier];
    if ((monthlyMessagesCount ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: "Monthly message limit reached",
          message:
            "You have used all chat messages included in your plan this month. Upgrade to continue.",
          upgradeUrl: "/billing",
        },
        { status: 403 },
      );
    }

    let sessionId = parsed.data.sessionId;
    if (sessionId) {
      const { data: existingSession, error: existingSessionError } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingSessionError) {
        throw existingSessionError;
      }

      if (!existingSession) {
        return NextResponse.json(
          { error: "Session not found" },
          { status: 404 },
        );
      }
    } else {
      const rawTitle =
        firstUserTitleSource(rawUiMessages).trim().slice(0, 50) || "New chat";
      const title = formatChatTitle(rawTitle) || rawTitle;
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title,
        })
        .select("id")
        .single();

      if (sessionError || !newSession) {
        return NextResponse.json(
          { error: "Failed to create chat session" },
          { status: 500 },
        );
      }

      sessionId = newSession.id;
    }

    const persistedUserContent = formatUserMessageForPersistence(
      latestExpandedUser,
    );
    if (!persistedUserContent.trim()) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 },
      );
    }

    const { error: userMessageInsertError } = await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: persistedUserContent,
      tokens_used: 0,
    });

    if (userMessageInsertError) {
      throw userMessageInsertError;
    }

    const model =
      planTier === "pro" || planTier === "business"
        ? NVIDIA_MODEL_PRO
        : NVIDIA_MODEL_DEFAULT;

    const maxOutputTokens = CHAT_MAX_OUTPUT_TOKENS[planTier];

    const forModel = expandedMessages.map(({ id: _id, ...rest }) => rest);
    const modelMessages = await convertToModelMessages(forModel);
    const conversationMessages = modelMessages.filter(
      (message) => message.role !== "system",
    );

    if (conversationMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid messages provided" },
        { status: 400 },
      );
    }

    const result = streamText({
      // NVIDIA's OpenAI-compatible endpoint supports Chat Completions.
      // Using `chat(...)` avoids the OpenAI Responses API path.
      model: nvidia.chat(model),
      system: GEMMA_CHAT_SYSTEM_PROMPT,
      maxRetries: 0,
      temperature: 0.2,
      topP: 0.95,
      maxOutputTokens,
      messages: conversationMessages,
      onError: ({ error }) => {
        Sentry.captureException(error);
        // StreamText onError is side-effect only; do not return a value.
      },
      onFinish: async ({ text, usage }) => {
        const totalTokens = usage.totalTokens ?? 0;

        if (text.trim().length > 0) {
          const { error: assistantMessageInsertError } = await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: text,
            tokens_used: totalTokens,
          });

          if (assistantMessageInsertError) {
            Sentry.captureException(assistantMessageInsertError);
          }
        }

        const { error: usageInsertError } = await supabase.from("usage_records").insert({
          user_id: user.id,
          event_type: "chat_message",
          tokens_used: totalTokens,
          month_year: monthYear,
        });

        if (usageInsertError) {
          Sentry.captureException(usageInsertError);
        }
      },
    });

    return result.toUIMessageStreamResponse({
      headers: {
        "x-chat-session-id": sessionId,
        "x-ai-model": model,
      },
    });
  } catch (error) {
    const message = getErrorMessage(error);
    if (isNvidiaPermissionDeniedError(error)) {
      return NextResponse.json(
        {
          error:
            "NVIDIA project access denied for the configured model/key. Use a model your key is allowed to access (set NVIDIA_MODEL_DEFAULT / NVIDIA_MODEL_PRO).",
          details: message,
          docs: "https://build.nvidia.com/settings/api-keys",
        },
        { status: 403 },
      );
    }
    if (isNvidiaQuotaError(error)) {
      return NextResponse.json(
        {
          error:
            "NVIDIA quota or rate limit exceeded for this API key/project. Use a key/project with available quota.",
          details: message,
          docs: "https://build.nvidia.com/settings/api-keys",
        },
        { status: 429 },
      );
    }

    Sentry.captureException(error);
    return NextResponse.json(
      { error: "Failed to process chat request." },
      { status: 500 },
    );
  }
}

function rateLimitUpgradeMessage(planTier: PlanTier | "free"): string {
  switch (planTier) {
    case "free":
      return "You have hit the Free plan chat rate limit. Upgrade to Starter or higher for higher daily limits and longer Gemma 4 replies.";
    case "starter":
      return "You have hit the Starter plan rate limit. Upgrade to Pro or Business for much higher daily throughput.";
    case "pro":
    case "business":
      return "You have hit the maximum request rate for your plan. Try again in a moment, or contact support if you need higher throughput.";
  }
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "Unknown error";
  }
}

function isNvidiaQuotaError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("quota exceeded") ||
    message.includes("exceeded your current quota") ||
    message.includes("rate limit") ||
    message.includes("too many requests")
  );
}

function isNvidiaPermissionDeniedError(error: unknown): boolean {
  const message = getErrorMessage(error).toLowerCase();
  return (
    message.includes("permission_denied") ||
    message.includes("denied access") ||
    message.includes("unauthorized") ||
    message.includes("invalid api key")
  );
}

type FileUiPart = Extract<UIMessage["parts"][number], { type: "file" }>;

function normalizeToUiMessage(input: unknown): UIMessage | null {
  if (!input || typeof input !== "object") return null;
  const message = input as {
    id?: string;
    role?: string;
    content?: unknown;
    parts?: UIMessage["parts"];
  };
  if (
    !message.role ||
    !["user", "assistant", "system"].includes(message.role)
  ) {
    return null;
  }
  const id = typeof message.id === "string" ? message.id : randomUUID();
  if (Array.isArray(message.parts)) {
    return {
      id,
      role: message.role as UIMessage["role"],
      parts: message.parts,
    };
  }
  if (typeof message.content === "string") {
    return {
      id,
      role: message.role as UIMessage["role"],
      parts: [{ type: "text", text: message.content }],
    };
  }
  return null;
}

function userMessageHasPayload(message: UIMessage): boolean {
  const text = message.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text"; text: string }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join("")
    .trim();
  if (text.length > 0) return true;
  return message.parts.some((part) => part.type === "file");
}

function firstUserTitleSource(messages: UIMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New chat";
  const text = first.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text"; text: string }> =>
        part.type === "text",
    )
    .map((part) => part.text)
    .join(" ")
    .trim();
  if (text) return text;
  const filePart = first.parts.find(
    (part): part is FileUiPart => part.type === "file",
  );
  if (filePart?.filename) return filePart.filename;
  return "New chat";
}

function truncateText(text: string, maxChars: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxChars) return trimmed;
  return `${trimmed.slice(0, maxChars)}\n\n[…truncated…]`;
}

function parseDataUrl(dataUrl: string): { mediaType: string; base64: string } | null {
  const match = dataUrl.match(/^data:([^;,]+);base64,(.+)$/);
  if (!match) return null;
  return { mediaType: match[1], base64: match[2] };
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  try {
    const result = await parser.getText();
    return result.text?.trim() ?? "";
  } finally {
    await parser.destroy();
  }
}

async function expandFileUiPart(part: FileUiPart): Promise<UIMessage["parts"]> {
  const { url, mediaType, filename } = part;
  if (mediaType.startsWith("image/")) {
    return [part];
  }
  if (!url.startsWith("data:")) {
    return [
      {
        type: "text",
        text: `[Attached: ${filename ?? "file"} — only uploaded files from this chat are supported]\n`,
      },
    ];
  }
  const parsed = parseDataUrl(url);
  if (!parsed) {
    return [
      {
        type: "text",
        text: `[Attached: ${filename ?? "file"} — could not read file data]\n`,
      },
    ];
  }
  const buf = Buffer.from(parsed.base64, "base64");
  const lowerName = filename?.toLowerCase() ?? "";
  const isPdf =
    mediaType === "application/pdf" || lowerName.endsWith(".pdf");
  const isDocx =
    mediaType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    lowerName.endsWith(".docx");
  if (isPdf) {
    const text = await extractPdfText(buf);
    const label = filename ?? "document.pdf";
    if (!text) {
      return [
        {
          type: "text",
          text: `[Extracted text from ${label}]\n(No extractable text found in this PDF.)\n`,
        },
      ];
    }
    return [
      {
        type: "text",
        text: `[Extracted text from ${label}]\n${truncateText(text, MAX_EXTRACTED_DOC_CHARS)}`,
      },
    ];
  }
  if (isDocx) {
    const { value } = await mammoth.extractRawText({ buffer: buf });
    const label = filename ?? "document.docx";
    const text = value.trim();
    if (!text) {
      return [
        {
          type: "text",
          text: `[Extracted text from ${label}]\n(No extractable text found in this document.)\n`,
        },
      ];
    }
    return [
      {
        type: "text",
        text: `[Extracted text from ${label}]\n${truncateText(text, MAX_EXTRACTED_DOC_CHARS)}`,
      },
    ];
  }
  return [
    {
      type: "text",
      text: `[Attached: ${filename ?? "file"} (${mediaType}) — use an image, PDF, or Word document]\n`,
    },
  ];
}

async function expandUserFilePartsInMessages(
  messages: UIMessage[],
): Promise<UIMessage[]> {
  const out: UIMessage[] = [];
  for (const msg of messages) {
    if (msg.role !== "user") {
      out.push(msg);
      continue;
    }
    const newParts: UIMessage["parts"] = [];
    for (const part of msg.parts) {
      if (part.type !== "file") {
        newParts.push(part);
        continue;
      }
      const expanded = await expandFileUiPart(part);
      newParts.push(...expanded);
    }
    out.push({ ...msg, parts: newParts });
  }
  return out;
}

function formatUserMessageForPersistence(message: UIMessage): string {
  const textParts = message.parts
    .filter(
      (part): part is Extract<typeof part, { type: "text"; text: string }> =>
        part.type === "text",
    )
    .map((part) => part.text);
  const fileParts = message.parts.filter(
    (part): part is FileUiPart => part.type === "file",
  );
  let out = textParts.join("").trim();
  if (fileParts.length > 0) {
    const lines = fileParts.map(
      (p) => `- ${p.filename ?? "file"} (${p.mediaType})`,
    );
    out = `${out}${out ? "\n\n" : ""}[Attachments]\n${lines.join("\n")}`;
  }
  return out.trim();
}
