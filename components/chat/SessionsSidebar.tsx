"use client"

import { useMemo, useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MoreHorizontal, Search } from "lucide-react"
import { toast } from "sonner"

import { renameSession } from "@/app/(dashboard)/chat/actions"
import type { ChatSession } from "@/components/chat/types"
import { formatChatTitle } from "@/lib/chat/format-chat-title"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { cn } from "@/lib/utils"

function formatSessionTimestamp(iso: string): string {
  const d = new Date(iso)
  const now = new Date()
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  const yesterday = new Date(now)
  yesterday.setDate(yesterday.getDate() - 1)
  const time = d.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  })
  if (isSameDay(d, now)) return time
  if (isSameDay(d, yesterday)) return `Yesterday · ${time}`
  const datePart =
    d.getFullYear() === now.getFullYear()
      ? d.toLocaleDateString("en-US", { month: "short", day: "numeric" })
      : d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  return `${datePart} · ${time}`
}

type SessionsSidebarProps = {
  sessions: ChatSession[]
  activeSessionId: string | null
  onSelectSession: (sessionId: string) => void
  onNewChat: () => void
  onSessionDeleted: (sessionId: string) => void
  onSessionRenamed: (sessionId: string, title: string) => void
}

export function SessionsSidebar({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewChat,
  onSessionDeleted,
  onSessionRenamed,
}: SessionsSidebarProps) {
  const [isPending, startTransition] = useTransition()
  const [searchValue, setSearchValue] = useState("")
  const [visibleCount, setVisibleCount] = useState(12)
  const [renameOpen, setRenameOpen] = useState(false)
  const [renameTarget, setRenameTarget] = useState<ChatSession | null>(null)
  const [renameTitleValue, setRenameTitleValue] = useState("")
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<ChatSession | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const filteredSessions = useMemo(() => {
    const query = searchValue.trim().toLowerCase()
    if (!query) return sessions
    return sessions.filter((session) => session.title.toLowerCase().includes(query))
  }, [searchValue, sessions])

  const primarySessions = filteredSessions.slice(0, visibleCount)
  const olderSessions = filteredSessions.slice(visibleCount)

  const openRenameDialog = (session: ChatSession) => {
    setRenameTarget(session)
    setRenameTitleValue(formatChatTitle(session.title) || session.title)
    setRenameOpen(true)
  }

  const submitRename = () => {
    if (!renameTarget) return
    const displayTitle =
      formatChatTitle(renameTitleValue.trim()) || renameTitleValue.trim()
    if (!displayTitle) {
      toast.error("Enter a title for this chat.")
      return
    }
    const previousTitle =
      formatChatTitle(renameTarget.title) || renameTarget.title
    if (displayTitle === previousTitle) {
      setRenameOpen(false)
      setRenameTarget(null)
      return
    }

    startTransition(async () => {
      const result = await renameSession({
        sessionId: renameTarget.id,
        title: displayTitle,
      })
      if (!result.ok) {
        toast.error(result.error ?? "Failed to rename chat")
        return
      }
      onSessionRenamed(renameTarget.id, displayTitle)
      toast.success("Session renamed")
      setRenameOpen(false)
      setRenameTarget(null)
    })
  }

  const openDeleteDialog = (session: ChatSession) => {
    setDeleteTarget(session)
    setDeleteOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleteTarget) return
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/chat/${deleteTarget.id}`, { method: "DELETE" })
      if (!response.ok) {
        toast.error("Failed to delete session")
        return
      }
      onSessionDeleted(deleteTarget.id)
      toast.success("Session deleted")
      setDeleteOpen(false)
      setDeleteTarget(null)
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <aside className="flex h-full w-full flex-col border-r border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-3">
        <div className="space-y-3 border-b border-[hsl(var(--color-border))] pb-3">
          <MagneticButton variant="primary" className="w-full justify-center" onClick={onNewChat}>
            + New chat
          </MagneticButton>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[hsl(var(--color-text-secondary))]" />
            <input
              value={searchValue}
              onChange={(event) => setSearchValue(event.target.value)}
              placeholder="Search chats..."
              className="glass h-10 w-full rounded-xl border border-[hsl(var(--color-border))] bg-black/25 pl-9 pr-3 text-sm text-[hsl(var(--color-text-primary))] outline-none placeholder:text-[hsl(var(--color-text-secondary))]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-3">
          {filteredSessions.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[hsl(var(--color-border))] p-4 text-center text-sm text-[hsl(var(--color-text-secondary))]">
              No conversations found.
            </div>
          ) : (
            <>
              <ul className="space-y-1">
                <AnimatePresence initial={false}>
                  {primarySessions.map((session) => (
                    <motion.li
                      key={session.id}
                      layout
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SessionRow
                        session={session}
                        isActive={session.id === activeSessionId}
                        isPending={isPending}
                        onSelect={() => onSelectSession(session.id)}
                        onRename={() => openRenameDialog(session)}
                        onDelete={() => openDeleteDialog(session)}
                      />
                    </motion.li>
                  ))}
                </AnimatePresence>
              </ul>

              {olderSessions.length > 0 ? (
                <div className="mt-4 space-y-2">
                  <p className="px-2 text-[10px] uppercase tracking-[0.14em] text-[hsl(var(--color-text-secondary))]">
                    Older
                  </p>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-xs text-[hsl(var(--color-text-secondary))]"
                    onClick={() => setVisibleCount((count) => count + 12)}
                  >
                    Load older sessions ({olderSessions.length})
                  </Button>
                </div>
              ) : null}
            </>
          )}
        </div>
      </aside>

      <Dialog
        open={renameOpen}
        onOpenChange={(open) => {
          setRenameOpen(open)
          if (!open) {
            setRenameTarget(null)
            setRenameTitleValue("")
          }
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[hsl(var(--color-text-primary))]">
              Rename chat
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--color-text-secondary))]">
              Choose a short title so you can find this conversation later.
            </DialogDescription>
          </DialogHeader>
          <Input
            autoFocus
            value={renameTitleValue}
            onChange={(event) => setRenameTitleValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault()
                submitRename()
              }
            }}
            placeholder="Chat title"
            className="h-10 rounded-xl border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-primary))] placeholder:text-[hsl(var(--color-text-secondary))]"
          />
          <DialogFooter className="gap-2 border-t border-[hsl(var(--color-border))] bg-transparent sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={isPending || !renameTitleValue.trim()}
              onClick={submitRename}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleteOpen}
        onOpenChange={(open) => {
          if (isDeleting) return
          setDeleteOpen(open)
          if (!open) setDeleteTarget(null)
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!isDeleting}>
          <DialogHeader>
            <DialogTitle className="font-display text-lg text-[hsl(var(--color-text-primary))]">
              Delete this chat?
            </DialogTitle>
            <DialogDescription className="text-[hsl(var(--color-text-secondary))]">
              {deleteTarget
                ? `“${formatChatTitle(deleteTarget.title) || deleteTarget.title}” and its messages will be removed. This cannot be undone.`
                : "This session and its messages will be removed. This cannot be undone."}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 border-t border-[hsl(var(--color-border))] bg-transparent sm:justify-end">
            <Button type="button" variant="outline" disabled={isDeleting} onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" disabled={isDeleting} onClick={() => void confirmDelete()}>
              {isDeleting ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function SessionRow({
  session,
  isActive,
  isPending,
  onSelect,
  onRename,
  onDelete,
}: {
  session: ChatSession
  isActive: boolean
  isPending: boolean
  onSelect: () => void
  onRename: () => void
  onDelete: () => void
}) {
  return (
    <div
      className={cn(
        "group/row flex items-center gap-1 rounded-lg px-2 pr-0.5 transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        isActive
          ? "bg-[hsl(var(--color-text-primary)/0.06)]"
          : "hover:bg-[hsl(var(--color-text-primary)/0.04)]",
      )}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 flex-1 rounded-md py-2 pl-0.5 pr-1 text-left outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[hsl(var(--color-bg-elevated))]"
      >
        <p
          className={cn(
            "truncate text-[0.8125rem] leading-snug transition-colors duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
            isActive
              ? "font-medium text-[hsl(var(--color-accent-soft))]"
              : "text-[hsl(var(--color-text-primary))]",
          )}
        >
          {formatChatTitle(session.title) || session.title}
        </p>
        <time
          dateTime={session.updated_at ?? session.created_at}
          className="mt-0.5 block truncate font-mono text-[10px] tabular-nums text-[hsl(var(--color-text-secondary)/0.85)]"
        >
          {formatSessionTimestamp(session.updated_at ?? session.created_at)}
        </time>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-7 shrink-0 rounded-md",
              "text-[hsl(var(--color-text-secondary))]",
              "opacity-0 transition-[opacity,background-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/row:opacity-100 group-focus-within/row:opacity-100",
              "hover:bg-[hsl(var(--color-text-primary)/0.06)] hover:text-[hsl(var(--color-text-primary))]",
              "focus-visible:opacity-100 focus-visible:ring-0 focus-visible:ring-offset-0",
              "focus-visible:bg-[hsl(var(--color-text-primary)/0.08)]",
              "data-[state=open]:bg-[hsl(var(--color-text-primary)/0.06)] data-[state=open]:ring-0",
              isActive && "opacity-100",
            )}
            aria-label="Session actions"
          >
            <MoreHorizontal className="size-3.5" strokeWidth={2} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          sideOffset={4}
          className={cn(
            "min-w-[7.25rem] rounded-lg border border-[hsl(var(--color-border))] p-0.5",
            "bg-[hsl(var(--color-bg-elevated))]",
          )}
        >
          <DropdownMenuItem
            disabled={isPending}
            onSelect={onRename}
            className={cn(
              "rounded-md px-2 py-1.5 text-xs",
              "!text-[hsl(var(--color-text-primary))]",
              "hover:!bg-[hsl(var(--color-text-primary)/0.08)] hover:!text-[hsl(var(--color-text-primary))]",
              "focus:!bg-[hsl(var(--color-text-primary)/0.08)] focus:!text-[hsl(var(--color-text-primary))]",
              "data-[highlighted]:!bg-[hsl(var(--color-text-primary)/0.08)] data-[highlighted]:!text-[hsl(var(--color-text-primary))]",
            )}
          >
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            variant="destructive"
            onSelect={onDelete}
            className={cn(
              "rounded-md px-2 py-1.5 text-xs",
              "hover:!bg-[hsl(var(--color-danger)/0.12)] hover:!text-[hsl(var(--color-danger))]",
              "focus:!bg-[hsl(var(--color-danger)/0.12)] focus:!text-[hsl(var(--color-danger))]",
              "data-[highlighted]:!bg-[hsl(var(--color-danger)/0.12)] data-[highlighted]:!text-[hsl(var(--color-danger))]",
            )}
          >
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
