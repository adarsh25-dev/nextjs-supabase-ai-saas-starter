import * as Sentry from "@sentry/nextjs"
import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { getRateLimitForUser } from "@/lib/ratelimit"
import { PLAN_LIMITS } from "@/lib/stripe/config"

const chatBodySchema = z.object({
  sessionId: z.string().uuid().optional(),
  messages: z.array(z.any()).min(1),
})

const openaiProvider = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY ?? "sk-placeholder",
})

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return NextResponse.json(
        { error: "Supabase env vars are not configured." },
        { status: 500 }
      )
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY is not configured." },
        { status: 500 }
      )
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const parsed = chatBodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const normalizedMessages = parsed.data.messages
      .map(normalizeIncomingMessage)
      .filter((message): message is { role: "user" | "assistant" | "system"; content: string } =>
        Boolean(message && message.content.trim())
      )

    if (normalizedMessages.length === 0) {
      return NextResponse.json({ error: "No valid messages provided" }, { status: 400 })
    }

    const now = new Date()
    const monthYear = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`

    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .select("plan_tier, status")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subscriptionError) {
      Sentry.captureException(subscriptionError)
    }

    const tier =
      subscription && (subscription.status === "active" || subscription.status === "trialing")
        ? subscription.plan_tier
        : "free"

    const rate = await getRateLimitForUser(user.id, tier)
    if (!rate.success) {
      return NextResponse.json(
        {
          error: "Rate limit exceeded. Please try again later or upgrade your plan.",
          limit: rate.limit,
          remaining: rate.remaining,
          upgradeUrl: "/pricing",
        },
        { status: 429 }
      )
    }

    const { count: monthlyMessagesCount } = await supabase
      .from("usage_records")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("event_type", "chat_message")
      .eq("month_year", monthYear)

    const limit = PLAN_LIMITS[tier]
    if ((monthlyMessagesCount ?? 0) >= limit) {
      return NextResponse.json(
        {
          error: "Monthly message limit reached. Upgrade your plan to continue chatting.",
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      )
    }

    let sessionId = parsed.data.sessionId
    if (sessionId) {
      const { data: existingSession } = await supabase
        .from("chat_sessions")
        .select("id")
        .eq("id", sessionId)
        .eq("user_id", user.id)
        .maybeSingle()

      if (!existingSession) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 })
      }
    } else {
      const firstUserMessage = normalizedMessages.find((m) => m.role === "user")?.content ?? "New chat"
      const title = firstUserMessage.trim().slice(0, 50) || "New chat"
      const { data: newSession, error: sessionError } = await supabase
        .from("chat_sessions")
        .insert({
          user_id: user.id,
          title,
        })
        .select("id")
        .single()

      if (sessionError || !newSession) {
        return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 })
      }

      sessionId = newSession.id
    }

    const latestUserMessage = [...normalizedMessages].reverse().find((m) => m.role === "user")
    if (!latestUserMessage) {
      return NextResponse.json({ error: "No user message found" }, { status: 400 })
    }

    await supabase.from("chat_messages").insert({
      session_id: sessionId,
      role: "user",
      content: latestUserMessage.content,
      tokens_used: 0,
    })

    const model = tier === "pro" || tier === "business" ? "gpt-4o" : "gpt-4o-mini"

    const result = streamText({
      model: openaiProvider(model),
      messages: normalizedMessages.map((message) => ({
        role: message.role,
        content: message.content,
      })),
      onFinish: async ({ text, usage }) => {
        const totalTokens = usage.totalTokens ?? 0

        if (text.trim().length > 0) {
          await supabase.from("chat_messages").insert({
            session_id: sessionId,
            role: "assistant",
            content: text,
            tokens_used: totalTokens,
          })
        }

        await supabase.from("usage_records").insert({
          user_id: user.id,
          event_type: "chat_message",
          tokens_used: totalTokens,
          month_year: monthYear,
        })
      },
    })

    return result.toUIMessageStreamResponse({
      headers: {
        "x-chat-session-id": sessionId,
      },
    })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to process chat request." }, { status: 500 })
  }
}

function normalizeIncomingMessage(input: unknown) {
  if (!input || typeof input !== "object") return null

  const message = input as {
    role?: string
    content?: unknown
    parts?: Array<{ type?: string; text?: string }>
  }

  if (!message.role || !["user", "assistant", "system"].includes(message.role)) {
    return null
  }

  if (typeof message.content === "string") {
    return { role: message.role as "user" | "assistant" | "system", content: message.content }
  }

  if (Array.isArray(message.parts)) {
    const content = message.parts
      .filter((part) => part?.type === "text" && typeof part.text === "string")
      .map((part) => part.text)
      .join("")
    return {
      role: message.role as "user" | "assistant" | "system",
      content,
    }
  }

  return null
}
