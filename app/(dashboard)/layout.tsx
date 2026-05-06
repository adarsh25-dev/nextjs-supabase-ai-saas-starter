import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/DashboardShell"
import { getSubscription } from "@/lib/billing/get-subscription"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard")
  }

  const [{ data: profile }, subscription] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name, email, avatar_url")
      .eq("id", user.id)
      .maybeSingle(),
    getSubscription(),
  ])
  const { data: recentSessions } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(5)

  const displayName =
    profile?.full_name?.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "User"

  return (
    <DashboardShell
      user={{
        name: displayName,
        email: profile?.email || user.email || "",
        avatarUrl: profile?.avatar_url || null,
      }}
      planTier={subscription.tier}
      recentSessions={recentSessions ?? []}
    >
      {children}
    </DashboardShell>
  )
}
