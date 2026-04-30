import type { Metadata } from "next"
import Link from "next/link"
import { MessageSquare } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSubscription as getSubscription } from "@/lib/hooks/use-subscription"
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

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Welcome back, {name}</h2>
        <p className="text-sm text-muted-foreground">Here is what happened in your workspace this month.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total chats this month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalChatsThisMonth}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total messages</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalMessages}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Tokens used this month</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{tokensThisMonth.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Plan tier</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className="capitalize">{subscription.tier}</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent sessions</CardTitle>
        </CardHeader>
        <CardContent>
          {recentSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
              <MessageSquare className="mb-3 size-8 text-muted-foreground" />
              <p className="font-medium">No chats yet</p>
              <p className="text-sm text-muted-foreground">Start your first conversation to see recent sessions.</p>
              <Link href="/dashboard/chat" className="mt-4 text-sm font-medium text-primary underline">
                Start chatting
              </Link>
            </div>
          ) : (
            <ul className="space-y-2">
              {recentSessions.map((session) => (
                <li key={session.id}>
                  <Link
                    href={`/dashboard/chat?session=${session.id}`}
                    className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50"
                  >
                    <span className="truncate font-medium">{session.title}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(session.created_at).toLocaleDateString()}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
