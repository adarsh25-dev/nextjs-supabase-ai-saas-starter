"use client"

import { AnimatePresence, motion } from "framer-motion"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { CreditCard, Home, LogOut, MessageSquare, Moon, Search, Settings, UserRound } from "lucide-react"
import type { ComponentType } from "react"

import { signOut } from "@/app/(auth)/actions"

type CommandAction = {
  id: string
  label: string
  keywords: string
  run: () => void
  icon?: ComponentType<{ className?: string }>
  shortcut?: string
}

type NavItem = {
  href: string
  label: string
  icon: ComponentType<{ className?: string }>
}

type AccountAction = {
  id: string
  label: string
  href?: string
  action?: () => void
  icon?: ComponentType<{ className?: string }>
}

type CommandPaletteProps = {
  recentSessions?: Array<{ id: string; title: string }>
  navItems?: NavItem[]
  accountActions?: AccountAction[]
}

const fallbackNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
]

export function CommandPalette({ recentSessions = [], navItems = fallbackNav, accountActions = [] }: CommandPaletteProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [, startTransition] = useTransition()

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen((prev) => !prev)
      }
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    const onOpen = () => setOpen(true)

    window.addEventListener("keydown", onKeyDown)
    window.addEventListener("command-palette:open", onOpen)
    return () => {
      window.removeEventListener("keydown", onKeyDown)
      window.removeEventListener("command-palette:open", onOpen)
    }
  }, [])

  const navigationActions = useMemo<CommandAction[]>(
    () => [
      ...navItems.map((item) => ({
        id: `nav-${item.href}`,
        label: `Go to ${item.label}`,
        keywords: `${item.label.toLowerCase()} navigation`,
        run: () => router.push(item.href),
        icon: item.icon,
      })),
      { id: "new-chat", label: "New chat", keywords: "ai message", run: () => router.push("/dashboard/chat"), icon: MessageSquare, shortcut: "+" },
    ],
    [navItems, router]
  )

  const defaultAccountActions: AccountAction[] = [
    { id: "account-settings", label: "Account settings", href: "/dashboard/settings", icon: UserRound },
    { id: "billing", label: "Billing", href: "/dashboard/billing", icon: CreditCard },
    {
      id: "signout",
      label: "Sign out",
      icon: LogOut,
      action: () => {
        startTransition(async () => {
          await signOut()
          router.push("/login")
          router.refresh()
        })
      },
    },
  ]

  const mergedAccountActions = accountActions.length > 0 ? accountActions : defaultAccountActions

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-20"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -8 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="w-full max-w-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <Command
              className="glass overflow-hidden rounded-2xl border border-[hsl(var(--color-text-primary)/0.12)] shadow-[0_0_80px_-28px_hsl(var(--color-accent)/0.45)]"
              loop
            >
              <div className="relative flex items-center border-b border-[hsl(var(--color-text-primary)/0.1)] px-4">
                <Search className="size-4 text-[hsl(var(--color-text-secondary))]" />
                <Command.Input
                  placeholder="Search routes, chats, and actions..."
                  className="w-full bg-transparent px-3 py-3 text-sm text-[hsl(var(--color-text-primary))] outline-none"
                />
              </div>
              <div className="pointer-events-none h-4 bg-gradient-to-b from-black/45 to-transparent" />
              <Command.List className="max-h-96 overflow-y-auto p-2">
                <Command.Empty className="px-2 py-3 text-sm text-[hsl(var(--color-text-secondary))]">
                  No results.
                </Command.Empty>

                <Command.Group heading="Quick navigation" className="text-[hsl(var(--color-text-secondary))]">
                  {navigationActions.map((action) => (
                    <CommandItem key={action.id} action={action} close={() => setOpen(false)} />
                  ))}
                </Command.Group>

                <Command.Group heading="Recent chats" className="text-[hsl(var(--color-text-secondary))]">
                  {recentSessions.slice(0, 5).map((session) => (
                    <CommandItem
                      key={session.id}
                      action={{
                        id: session.id,
                        label: session.title || "Untitled chat",
                        keywords: "chat session recent",
                        icon: MessageSquare,
                        run: () => router.push(`/dashboard/chat?session=${session.id}`),
                      }}
                      close={() => setOpen(false)}
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="Account actions" className="text-[hsl(var(--color-text-secondary))]">
                  {mergedAccountActions.map((action) => (
                    <CommandItem
                      key={action.id}
                      action={{
                        id: action.id,
                        label: action.label,
                        keywords: `account ${action.label.toLowerCase()}`,
                        icon: action.icon ?? UserRound,
                        run: () => {
                          if (action.action) {
                            action.action()
                            return
                          }
                          if (action.href) {
                            router.push(action.href)
                          }
                        },
                      }}
                      close={() => setOpen(false)}
                    />
                  ))}
                </Command.Group>

                <Command.Group heading="Theme" className="text-[hsl(var(--color-text-secondary))]">
                  <CommandItem
                    action={{
                      id: "theme-dark",
                      label: "Dark theme (active)",
                      keywords: "dark theme mode",
                      icon: Moon,
                      shortcut: "D",
                      run: () => undefined,
                    }}
                    close={() => setOpen(false)}
                  />
                </Command.Group>
              </Command.List>
              <div className="pointer-events-none h-4 bg-gradient-to-t from-black/45 to-transparent" />
            </Command>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}

function CommandItem({ action, close }: { action: CommandAction; close: () => void }) {
  const Icon = action.icon ?? Search
  return (
    <Command.Item
      keywords={action.keywords.split(" ")}
      onSelect={() => {
        close()
        action.run()
      }}
      className="group/item flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-sm text-[hsl(var(--color-text-primary))] data-[selected=true]:bg-[hsl(var(--color-text-primary)/0.08)]"
    >
      <Icon className="size-4 text-[hsl(var(--color-text-secondary))]" />
      <span className="flex-1 truncate">{action.label}</span>
      {action.shortcut ? (
        <kbd className="rounded border border-[hsl(var(--color-text-primary)/0.2)] px-1.5 py-0.5 text-[10px] text-[hsl(var(--color-text-secondary))]">
          {action.shortcut}
        </kbd>
      ) : null}
    </Command.Item>
  )
}
