import type { Metadata } from "next"

import { brandSectionTitle } from "@/lib/brand"
import { redirect } from "next/navigation"

import { DashboardOverviewClient } from "@/components/dashboard/DashboardOverviewClient"
import { PLAN_LIMITS } from "@/lib/stripe/config"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: brandSectionTitle("Dashboard"),
  description: "Overview of usage, recent conversations, and account activity.",
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  const monthStart = new Date()
  monthStart.setUTCDate(1)
  monthStart.setUTCHours(0, 0, 0, 0)
  const monthYear = `${monthStart.getUTCFullYear()}-${String(monthStart.getUTCMonth() + 1).padStart(2, "0")}`

  const [{ data: profile }, { data: subscription }, { count: totalChatsThisMonth }, { data: usageRows }, { data: recentSessions }] =
    await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select("plan_tier, status")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase
        .from("chat_sessions")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString()),
      supabase
        .from("usage_records")
        .select("event_type, tokens_used")
        .eq("user_id", user.id)
        .eq("month_year", monthYear),
      supabase
        .from("chat_sessions")
        .select("id, title, created_at, updated_at")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(6),
    ])

  const tier =
    subscription && (subscription.status === "active" || subscription.status === "trialing")
      ? subscription.plan_tier
      : "free"

  const totalMessages = (usageRows ?? []).filter((row) => row.event_type === "chat_message").length
  const tokensThisMonth = (usageRows ?? []).reduce((sum, row) => sum + (row.tokens_used ?? 0), 0)

  return (
    <DashboardOverviewClient
      name={profile?.full_name?.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "User"}
      planTier={tier}
      totalChatsThisMonth={totalChatsThisMonth ?? 0}
      totalMessages={totalMessages}
      tokensThisMonth={tokensThisMonth}
      monthlyMessageLimit={PLAN_LIMITS[tier]}
      recentSessions={recentSessions ?? []}
    />
  )
}
