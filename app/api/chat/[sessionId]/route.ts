import * as Sentry from "@sentry/nextjs"
import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"

const sessionParamsSchema = z.object({
  sessionId: z.string().uuid(),
})

export async function GET(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const parsedParams = sessionParamsSchema.safeParse(params)
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 })
    }
    const { sessionId } = parsedParams.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("id")
      .eq("id", sessionId)
      .eq("user_id", user.id)
      .maybeSingle()

    if (sessionError) throw sessionError

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 })
    }

    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true })

    if (messagesError) throw messagesError

    return NextResponse.json({ messages: messages ?? [] })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to load chat session." }, { status: 500 })
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const parsedParams = sessionParamsSchema.safeParse(params)
    if (!parsedParams.success) {
      return NextResponse.json({ error: "Invalid session id" }, { status: 400 })
    }
    const { sessionId } = parsedParams.data

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { error } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId)
      .eq("user_id", user.id)

    if (error) {
      return NextResponse.json({ error: "Failed to delete session" }, { status: 500 })
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to delete session." }, { status: 500 })
  }
}
