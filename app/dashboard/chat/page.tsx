import { redirect } from "next/navigation"

import { ChatLayout } from "@/components/chat/chat-layout"
import { createClient } from "@/lib/supabase/server"

export default async function ChatPage({
  searchParams,
}: {
  searchParams: { session?: string }
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/dashboard/chat")
  }

  const { data: sessions } = await supabase
    .from("chat_sessions")
    .select("id, title, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  const activeSessionId =
    searchParams.session && sessions?.some((session) => session.id === searchParams.session)
      ? searchParams.session
      : sessions?.[0]?.id

  const { data: messages } = activeSessionId
    ? await supabase
        .from("chat_messages")
        .select("id, role, content, created_at")
        .eq("session_id", activeSessionId)
        .order("created_at", { ascending: true })
    : { data: [] }

  return (
    <ChatLayout
      initialSessions={sessions ?? []}
      initialSessionId={activeSessionId ?? null}
      initialMessages={messages ?? []}
    />
  )
}
