import * as Sentry from "@sentry/nextjs"
import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: latestSession } = await supabase
      .from("chat_sessions")
      .select("id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    return NextResponse.json({ session: latestSession ?? null })
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Failed to fetch latest session." }, { status: 500 })
  }
}
