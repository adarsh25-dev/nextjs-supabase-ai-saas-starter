import type { Metadata } from "next"

import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient"
import { useSubscription as getSubscription } from "@/lib/hooks/use-subscription"
import { PLAN_LIMITS } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Dashboard — SaaS Starter",
  description: "Overview of usage, sessions, and plan details.",
}

function monthYearUTC() {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
}

export default async function DashboardHomePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const month = monthYearUTC()
  const [subscription, profileRes, sessionsRes, sessionsCountRes, messagesCountRes, tokensRes] =
    await Promise.all([
      getSubscription(),
      supabase.from("profiles").select("full_name, email").eq("id", user.id).maybeSingle(),
      supabase
        .from("chat_sessions")
        .select("id, title, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase
        .from("chat_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${month}-01`),
      supabase
        .from("usage_records")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event_type", "chat_message"),
      supabase
        .from("usage_records")
        .select("tokens_used")
        .eq("user_id", user.id)
        .eq("month_year", month),
    ])

  const name =
    profileRes.data?.full_name?.trim() ||
    user.user_metadata?.full_name ||
    user.email?.split("@")[0] ||
    "builder"

  const recentSessions = sessionsRes.data ?? []
  const totalChatsThisMonth = sessionsCountRes.count ?? 0
  const totalMessages = messagesCountRes.count ?? 0
  const tokensThisMonth = (tokensRes.data ?? []).reduce((sum, record) => sum + (record.tokens_used ?? 0), 0)
  const monthlyMessageLimit = PLAN_LIMITS[subscription.tier] ?? PLAN_LIMITS.free

  return (
    <DashboardOverviewClient
      name={name}
      planTier={subscription.tier}
      totalChatsThisMonth={totalChatsThisMonth}
      totalMessages={totalMessages}
      tokensThisMonth={tokensThisMonth}
      monthlyMessageLimit={monthlyMessageLimit}
      recentSessions={recentSessions}
    />
  )
}
