import type { Metadata } from "next"
import { redirect } from "next/navigation"

import { ChatLayout } from "@/components/chat/chat-layout"
import { createClient } from "@/lib/supabase/server"

export const metadata: Metadata = {
  title: "Chat — SaaS Starter",
  description: "Stream AI responses, manage sessions, and continue conversations.",
}

const SESSION_UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

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
    redirect("/login?next=/chat")
  }

  const paramSession = searchParams.session

  const sessionsQuery = supabase
    .from("chat_sessions")
    .select("id, title, created_at, updated_at")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const messagesForParamPromise =
    paramSession && SESSION_UUID_RE.test(paramSession)
      ? supabase
          .from("chat_messages")
          .select("id, role, content, created_at")
          .eq("session_id", paramSession)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: null })

  const [{ data: sessions }, paramMessagesResult] = await Promise.all([
    sessionsQuery,
    messagesForParamPromise,
  ])

  const sessionList = sessions ?? []

  const paramOwned =
    Boolean(paramSession) && sessionList.some((session) => session.id === paramSession)

  const activeSessionId = paramOwned
    ? paramSession!
    : sessionList[0]?.id ?? null

  let initialMessages = paramOwned ? (paramMessagesResult.data ?? []) : []

  if (!paramOwned && activeSessionId) {
    const { data } = await supabase
      .from("chat_messages")
      .select("id, role, content, created_at")
      .eq("session_id", activeSessionId)
      .order("created_at", { ascending: true })
    initialMessages = data ?? []
  }

  return (
    <ChatLayout
      initialSessions={sessionList}
      initialSessionId={activeSessionId}
      initialMessages={initialMessages}
    />
  )
}
