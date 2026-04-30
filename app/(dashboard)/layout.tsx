import { redirect } from "next/navigation"

import { DashboardShell } from "@/components/dashboard/dashboard-shell"
import { useSubscription as getSubscription } from "@/lib/hooks/use-subscription"
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
    >
      {children}
    </DashboardShell>
  )
}
