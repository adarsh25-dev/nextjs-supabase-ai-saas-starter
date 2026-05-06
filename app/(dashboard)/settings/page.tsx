import type { Metadata } from "next"
import dynamic from "next/dynamic"

import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"

const SettingsTabs = dynamic(
  () => import("@/components/dashboard/settings-tabs").then((mod) => mod.SettingsTabs),
  {
    ssr: false,
    loading: () => (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-md" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-10 w-36" />
      </div>
    ),
  }
)

export const metadata: Metadata = {
  title: "Settings — SaaS Starter",
  description: "Manage profile, credentials, linked accounts, and preferences.",
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, avatar_url")
    .eq("id", user.id)
    .maybeSingle()

  const hasGoogle = Boolean(user.app_metadata?.providers?.includes?.("google"))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-[hsl(var(--color-text-primary))]">Settings</h1>
        <p className="mt-1 text-sm text-[hsl(var(--color-text-secondary))]">
          Manage profile, account security, notifications, and API access.
        </p>
      </div>
      <SettingsTabs
        userId={user.id}
        email={profile?.email || user.email || ""}
        fullName={profile?.full_name || user.user_metadata?.full_name || ""}
        avatarUrl={profile?.avatar_url || null}
        hasGoogle={hasGoogle}
      />
    </div>
  )
}
