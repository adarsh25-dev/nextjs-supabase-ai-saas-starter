"use server"

import * as Sentry from "@sentry/nextjs"
import { z } from "zod"

import { formatChatTitle } from "@/lib/chat/format-chat-title"
import { createClient } from "@/lib/supabase/server"

const renameSessionSchema = z.object({
  sessionId: z.string().uuid(),
  title: z.string().trim().min(1).max(80),
})

export async function renameSession(input: {
  sessionId: string
  title: string
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const parsed = renameSessionSchema.safeParse(input)
    if (!parsed.success) {
      return { ok: false, error: "Invalid session title." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, error: "Unauthorized." }
    }

    const displayTitle = formatChatTitle(parsed.data.title) || parsed.data.title

    const { error } = await supabase
      .from("chat_sessions")
      .update({ title: displayTitle })
      .eq("id", parsed.data.sessionId)
      .eq("user_id", user.id)

    if (error) {
      return { ok: false, error: "Failed to rename session." }
    }

    return { ok: true }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, error: "Failed to rename session." }
  }
}
