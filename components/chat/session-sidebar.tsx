"use client"

import { useTransition } from "react"
import { MoreHorizontal, Plus } from "lucide-react"
import { toast } from "sonner"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { renameSession } from "@/app/(dashboard)/dashboard/chat/actions"
import type { ChatSession } from "@/components/chat/types"
import { cn } from "@/lib/utils"

type SessionSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onSessionDeleted: (sessionId: string) => void
  onSessionRenamed: (sessionId: string, title: string) => void
}

export function SessionSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onSessionDeleted,
  onSessionRenamed,
}: SessionSidebarProps) {
  const [isPending, startTransition] = useTransition()

  const handleRename = (session: ChatSession) => {
    const title = window.prompt("Rename chat", session.title)?.trim()
    if (!title || title === session.title) return

    startTransition(async () => {
      const result = await renameSession({ sessionId: session.id, title })
      if (!result.ok) {
        toast.error(result.error ?? "Failed to rename chat")
        return
      }
      onSessionRenamed(session.id, title)
      toast.success("Session renamed")
    })
  }

  const handleDelete = async (session: ChatSession) => {
    const confirmed = window.confirm("Delete this chat session?")
    if (!confirmed) return

    const response = await fetch(`/api/chat/${session.id}`, { method: "DELETE" })
    if (!response.ok) {
      toast.error("Failed to delete session")
      return
    }

    onSessionDeleted(session.id)
    toast.success("Session deleted")
  }

  return (
    <aside className="flex h-full w-80 shrink-0 flex-col border-r bg-background">
      <div className="flex items-center justify-between border-b p-3">
        <h2 className="text-sm font-semibold">Conversations</h2>
        <Button size="sm" onClick={onNewChat}>
          <Plus className="mr-1 size-4" />
          New chat
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {sessions.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
            No conversations yet.
          </div>
        ) : (
          <ul className="space-y-1">
            {sessions.map((session) => (
              <li key={session.id}>
                <div
                  className={cn(
                    "group flex items-center justify-between rounded-md px-2 py-2",
                    session.id === activeSessionId
                      ? "bg-muted text-foreground"
                      : "hover:bg-muted/60"
                  )}
                >
                  <button
                    type="button"
                    className="min-w-0 flex-1 truncate text-left text-sm"
                    onClick={() => onSelectSession(session.id)}
                  >
                    {session.title}
                  </button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 opacity-60 group-hover:opacity-100"
                        aria-label="Session actions"
                      >
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem disabled={isPending} onClick={() => handleRename(session)}>
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDelete(session)}
                      >
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </aside>
  )
}
