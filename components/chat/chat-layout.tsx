"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { ChatInterface } from "@/components/chat/chat-interface"
import { SessionSidebar } from "@/components/chat/session-sidebar"
import type { ChatMessage, ChatSession } from "@/components/chat/types"

type ChatLayoutProps = {
  initialSessions: ChatSession[]
  initialSessionId: string | null
  initialMessages: ChatMessage[]
}

export function ChatLayout({
  initialSessions,
  initialSessionId,
  initialMessages,
}: ChatLayoutProps) {
  const router = useRouter()
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(initialSessionId)
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)

  const loadSession = async (sessionId: string) => {
    setActiveSessionId(sessionId)
    router.push(`/dashboard/chat?session=${sessionId}`)

    const response = await fetch(`/api/chat/${sessionId}`)
    if (!response.ok) {
      toast.error("Unable to load session")
      return
    }
    const payload = await response.json()
    setMessages(payload.messages ?? [])
  }

  const newChat = () => {
    setActiveSessionId(null)
    setMessages([])
    router.push("/dashboard/chat")
  }

  const handleSessionCreated = (sessionId: string, title: string) => {
    const createdSession: ChatSession = {
      id: sessionId,
      title: title || "New chat",
      created_at: new Date().toISOString(),
    }
    setSessions((prev) => [createdSession, ...prev.filter((session) => session.id !== sessionId)])
    setActiveSessionId(sessionId)
    router.push(`/dashboard/chat?session=${sessionId}`)
  }

  const handleSessionDeleted = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((session) => session.id !== sessionId)
      if (activeSessionId === sessionId) {
        if (remaining[0]) {
          void loadSession(remaining[0].id)
        } else {
          newChat()
        }
      }
      return remaining
    })
  }

  const handleSessionRenamed = (sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, title } : session))
    )
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
      <SessionSidebar
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={(sessionId) => void loadSession(sessionId)}
        onNewChat={newChat}
        onSessionDeleted={handleSessionDeleted}
        onSessionRenamed={handleSessionRenamed}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <ChatInterface
          key={activeSessionId ?? "new"}
          sessionId={activeSessionId}
          initialMessages={messages}
          onSessionCreated={handleSessionCreated}
        />
      </main>
    </div>
  )
}
