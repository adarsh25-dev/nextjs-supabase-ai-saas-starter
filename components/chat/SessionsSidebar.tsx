"use client"

import { useMemo, useState, useTransition } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MoreHorizontal, Search } from "lucide-react"
import { toast } from "sonner"

import { renameSession } from "@/app/(dashboard)/chat/actions"
import type { ChatSession } from "@/components/chat/types"
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
    setRenameTitleValue(session.title)
    setRenameOpen(true)
  }

  const submitRename = () => {
    if (!renameTarget) return
    const title = renameTitleValue.trim()
    if (!title) {
      toast.error("Enter a title for this chat.")
      return
    }
    if (title === renameTarget.title) {
      setRenameOpen(false)
      setRenameTarget(null)
      return
    }

    startTransition(async () => {
      const result = await renameSession({ sessionId: renameTarget.id, title })
      if (!result.ok) {
        toast.error(result.error ?? "Failed to rename chat")
        return
      }
      onSessionRenamed(renameTarget.id, title)
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
                ? `“${deleteTarget.title}” and its messages will be removed. This cannot be undone.`
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
        "group relative rounded-lg border border-transparent p-3 transition-all duration-200 hover:bg-[hsl(var(--color-text-primary)/0.04)]",
        isActive
          ? "gradient-border border-[hsl(var(--color-border))] bg-[hsl(var(--color-text-primary)/0.05)]"
          : ""
      )}
    >
      <button type="button" className="w-full text-left" onClick={onSelect}>
        <p className="truncate text-sm text-[hsl(var(--color-text-primary))]">{session.title}</p>
        <p className="mt-1 truncate text-xs text-[hsl(var(--color-text-secondary))]">
          Continue this conversation...
        </p>
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-2 size-7 opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Session actions"
          >
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="glass border border-[hsl(var(--color-border))]" align="end">
          <DropdownMenuItem disabled={isPending} onSelect={onRename}>
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem className="text-destructive focus:text-destructive" onSelect={onDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
