import "server-only"

import { createClient } from "@/lib/supabase/server"
import { PLAN_LIMITS } from "@/lib/stripe/config"

type Tier = "free" | "starter" | "pro" | "business"
type Status = "active" | "trialing" | "past_due" | "canceled" | "incomplete"

export type SubscriptionSnapshot = {
  tier: Tier
  status: Status
  isActive: boolean
  limit: number
  usage: number
  renewalDate: string | null
}

export async function getSubscription(): Promise<SubscriptionSnapshot> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return {
      tier: "free",
      status: "incomplete",
      isActive: false,
      limit: PLAN_LIMITS.free,
      usage: 0,
      renewalDate: null,
    }
  }

  const { data: currentSubscription } = await supabase
    .from("subscriptions")
    .select("plan_tier, status, current_period_end")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const now = new Date()
  const monthYear = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`
  const { count } = await supabase
    .from("usage_records")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("event_type", "chat_message")
    .eq("month_year", monthYear)

  const tier: Tier = currentSubscription?.plan_tier ?? "free"
  const status: Status = currentSubscription?.status ?? "incomplete"
  const usage = count ?? 0
  const isActive = status === "active" || status === "trialing"

  return {
    tier,
    status,
    isActive,
    limit: PLAN_LIMITS[tier],
    usage,
    renewalDate: currentSubscription?.current_period_end ?? null,
  }
}
