"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Drawer } from "vaul";

import { ChatInterface } from "@/components/chat/chat-interface";
import { SessionsSidebar } from "@/components/chat/SessionsSidebar";
import type { ChatMessage, ChatSession } from "@/components/chat/types";
import { formatChatTitle } from "@/lib/chat/format-chat-title";

function reorderSessionByRecency(
  sessions: ChatSession[],
  sessionId: string,
): ChatSession[] {
  const now = new Date().toISOString();
  const idx = sessions.findIndex((s) => s.id === sessionId);
  if (idx === -1) return sessions;
  const bumped: ChatSession = { ...sessions[idx], updated_at: now };
  return [bumped, ...sessions.filter((s) => s.id !== sessionId)];
}

type ChatLayoutProps = {
  initialSessions: ChatSession[];
  initialSessionId: string | null;
  initialMessages: ChatMessage[];
};

export function ChatLayout({
  initialSessions,
  initialSessionId,
  initialMessages,
}: ChatLayoutProps) {
  const router = useRouter();
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    initialSessionId,
  );
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [mobileSessionsOpen, setMobileSessionsOpen] = useState(false);

  const loadSession = async (sessionId: string) => {
    const response = await fetch(`/api/chat/${sessionId}`);
    if (!response.ok) {
      toast.error("Unable to load session");
      return;
    }
    const payload = await response.json();
    const loaded = payload.messages ?? [];
    setActiveSessionId(sessionId);
    setMessages(loaded);
    setMobileSessionsOpen(false);
    router.push(`/chat?session=${sessionId}`);
  };

  const newChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    router.push("/chat");
  };

  const handleSessionCreated = (sessionId: string, title: string) => {
    const displayTitle =
      formatChatTitle(title || "New chat") || title || "New chat";
    const now = new Date().toISOString();
    const createdSession: ChatSession = {
      id: sessionId,
      title: displayTitle,
      created_at: now,
      updated_at: now,
    };
    setSessions((prev) => [
      createdSession,
      ...prev.filter((session) => session.id !== sessionId),
    ]);
    setActiveSessionId(sessionId);
    router.push(`/chat?session=${sessionId}`);
  };

  const handleSessionDeleted = (sessionId: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((session) => session.id !== sessionId);
      if (activeSessionId === sessionId) {
        if (remaining[0]) {
          void loadSession(remaining[0].id);
        } else {
          newChat();
        }
      }
      return remaining;
    });
  };

  const handleSessionRenamed = (sessionId: string, title: string) => {
    const displayTitle = formatChatTitle(title) || title;
    setSessions((prev) =>
      prev.map((session) =>
        session.id === sessionId
          ? { ...session, title: displayTitle }
          : session,
      ),
    );
  };

  const activeSession = sessions.find(
    (session) => session.id === activeSessionId,
  );

  return (
    <div className="flex h-[calc(100vh-4rem)] min-h-0 overflow-hidden">
      <aside className="hidden h-full w-[280px] shrink-0 lg:block">
        <SessionsSidebar
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={(sessionId) => void loadSession(sessionId)}
          onNewChat={newChat}
          onSessionDeleted={handleSessionDeleted}
          onSessionRenamed={handleSessionRenamed}
        />
      </aside>

      <Drawer.Root
        open={mobileSessionsOpen}
        onOpenChange={setMobileSessionsOpen}
      >
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 lg:hidden" />
          <Drawer.Content className="glass fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-2xl border border-[hsl(var(--color-border))] lg:hidden">
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-[hsl(var(--color-text-primary)/0.2)]" />
            <div className="h-[75vh]">
              <SessionsSidebar
                sessions={sessions}
                activeSessionId={activeSessionId}
                onSelectSession={(sessionId) => void loadSession(sessionId)}
                onNewChat={newChat}
                onSessionDeleted={handleSessionDeleted}
                onSessionRenamed={handleSessionRenamed}
              />
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col">
        <ChatInterface
          key={activeSessionId ?? "new"}
          sessionId={activeSessionId}
          sessionTitle={
            formatChatTitle(activeSession?.title ?? "New chat") ||
            activeSession?.title ||
            "New chat"
          }
          initialMessages={messages}
          onSessionCreated={handleSessionCreated}
          onSessionActivity={(sessionId) =>
            setSessions((prev) => reorderSessionByRecency(prev, sessionId))
          }
          onNewChat={newChat}
          onOpenSessionsMobile={() => setMobileSessionsOpen(true)}
        />
      </main>
    </div>
  );
}
