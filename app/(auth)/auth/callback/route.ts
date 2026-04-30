import * as Sentry from "@sentry/nextjs"
import { NextResponse } from "next/server"

import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get("code")
    const next = url.searchParams.get("next") ?? "/dashboard"
    const safeNext = next.startsWith("/") ? next : "/dashboard"

    if (code) {
      const supabase = await createClient()
      await supabase.auth.exchangeCodeForSession(code)
    }

    return NextResponse.redirect(new URL(safeNext, request.url))
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.redirect(new URL("/login", request.url))
  }
}
