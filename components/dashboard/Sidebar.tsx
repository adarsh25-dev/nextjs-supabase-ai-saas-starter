"use client"

import { AnimatePresence, motion } from "framer-motion"
import { Command, PanelLeftClose, Search } from "lucide-react"
import Link from "next/link"
import { Drawer } from "vaul"

import type { DashboardNavItem } from "@/components/dashboard/DashboardShell"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/ui/primitives/Logo"
import { cn } from "@/lib/utils"

type SidebarProps = {
  pathname: string
  user: { name: string; email: string; avatarUrl: string | null }
  planTier: "free" | "starter" | "pro" | "business"
  navItems: DashboardNavItem[]
  recentSessions: Array<{ id: string; title: string; created_at: string }>
  onSignOut: () => void
  isSigningOut: boolean
  mobileOpen: boolean
  onMobileOpenChange: (open: boolean) => void
  collapsed: boolean
  onCollapsedChange: (collapsed: boolean) => void
}

function initialsFromName(name: string, email: string) {
  const trimmed = name.trim()
  if (!trimmed) return email.slice(0, 2).toUpperCase()
  const pieces = trimmed.split(/\s+/).slice(0, 2)
  return pieces.map((piece) => piece.charAt(0).toUpperCase()).join("")
}

function triggerPalette() {
  window.dispatchEvent(new CustomEvent("command-palette:open"))
}

export function Sidebar({
  pathname,
  user,
  planTier,
  navItems,
  recentSessions,
  onSignOut,
  isSigningOut,
  mobileOpen,
  onMobileOpenChange,
  collapsed,
  onCollapsedChange,
}: SidebarProps) {
  const initials = initialsFromName(user.name, user.email)
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <aside
        className={cn(
          "hidden h-screen w-full border-r border-[hsl(var(--color-text-primary)/0.08)] bg-black/70 p-3 backdrop-blur transition-[width] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:flex lg:flex-col"
        )}
      >
        <div className="mb-3 flex items-center justify-between">
          <AnimatePresence initial={false}>
            {!collapsed ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Logo size="md" />
              </motion.div>
            ) : (
              <Logo size="sm" />
            )}
          </AnimatePresence>
          <button
            type="button"
            onClick={() => onCollapsedChange(!collapsed)}
            className="inline-flex size-8 items-center justify-center rounded-lg border border-[hsl(var(--color-text-primary)/0.12)] text-[hsl(var(--color-text-secondary))] transition-all duration-200 hover:bg-[hsl(var(--color-text-primary)/0.08)]"
            aria-label="Collapse sidebar"
          >
            <motion.div animate={{ rotate: collapsed ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <PanelLeftClose className="size-4" />
            </motion.div>
          </button>
        </div>

        <button
          type="button"
          onClick={triggerPalette}
          className="glass flex h-10 items-center gap-2 rounded-lg px-3 text-sm text-[hsl(var(--color-text-secondary))]"
        >
          <Search className="size-4" />
          <AnimatePresence>
            {!collapsed ? (
              <motion.span
                className="flex flex-1 items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <span className="text-left">Search...</span>
                <span className="inline-flex items-center gap-1 rounded border border-[hsl(var(--color-text-primary)/0.18)] px-1.5 py-0.5 text-[10px]">
                  <Command className="size-3" />K
                </span>
              </motion.span>
            ) : null}
          </AnimatePresence>
        </button>

        <div className="mt-6 flex-1 overflow-y-auto">
          {!collapsed ? (
            <p className="px-2 text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--color-text-secondary)/0.75)]">
              Workspace
            </p>
          ) : null}
          <nav className="mt-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-[hsl(var(--color-text-secondary))] transition-all duration-200 hover:bg-[hsl(var(--color-text-primary)/0.05)] hover:text-[hsl(var(--color-text-primary))]",
                  isActive(item.href) ? "bg-[hsl(var(--color-text-primary)/0.08)] text-[hsl(var(--color-text-primary))]" : ""
                )}
              >
                {isActive(item.href) ? (
                  <motion.span
                    layoutId="active-nav-indicator"
                    className="absolute inset-y-1 left-0 w-1 rounded-full bg-[hsl(var(--color-accent-soft))] shadow-[0_0_18px_hsl(var(--color-accent)/0.7)]"
                  />
                ) : null}
                <motion.div whileHover={{ scale: 1.06 }}>
                  <item.icon className="size-4" />
                </motion.div>
                <AnimatePresence>
                  {!collapsed ? (
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {item.label}
                    </motion.span>
                  ) : null}
                </AnimatePresence>
              </Link>
            ))}
          </nav>

          <div className="my-4 h-px bg-[hsl(var(--color-text-primary)/0.08)]" />
          {!collapsed ? (
            <>
              <p className="px-2 text-[10px] uppercase tracking-[0.16em] text-[hsl(var(--color-text-secondary)/0.75)]">Recent</p>
              <div className="mt-2 space-y-1">
                {recentSessions.slice(0, 5).map((session) => (
                  <Link
                    key={session.id}
                    href={`/dashboard/chat?session=${session.id}`}
                    className="block rounded-lg px-3 py-2 text-xs text-[hsl(var(--color-text-secondary))] transition-colors hover:bg-[hsl(var(--color-text-primary)/0.05)] hover:text-[hsl(var(--color-text-primary))]"
                    title={session.title}
                  >
                    <span className="block truncate">{session.title}</span>
                  </Link>
                ))}
              </div>
            </>
          ) : null}
        </div>

        <div className="mt-3 space-y-2">
          <div className="glass rounded-xl p-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-full">
                <div className="flex items-center gap-3 text-left">
                  <Avatar className="size-8 transition-shadow hover:shadow-[0_0_16px_hsl(var(--color-accent)/0.5)]">
                    <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                    <AvatarFallback>{initials}</AvatarFallback>
                  </Avatar>
                  {!collapsed ? (
                    <div className="min-w-0">
                      <p className="truncate text-sm text-[hsl(var(--color-text-primary))]">{user.name}</p>
                      <p className="truncate text-xs text-[hsl(var(--color-text-secondary))]">{user.email}</p>
                    </div>
                  ) : null}
                </div>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="glass border border-[hsl(var(--color-text-primary)/0.14)]" align="end">
                <DropdownMenuLabel>My account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/billing">Billing</Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={onSignOut} disabled={isSigningOut}>
                  {isSigningOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {!collapsed ? (
            <p className="px-2 text-[11px] text-[hsl(var(--color-text-secondary))]">Powered by SaaS Starter · {planTier}</p>
          ) : null}
        </div>
      </aside>

      <Drawer.Root open={mobileOpen} onOpenChange={onMobileOpenChange}>
        <Drawer.Portal>
          <Drawer.Overlay className="fixed inset-0 z-40 bg-black/70 lg:hidden" />
          <Drawer.Content className="glass fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-[hsl(var(--color-text-primary)/0.12)] p-4 lg:hidden">
            <div className="mx-auto mb-4 h-1.5 w-14 rounded-full bg-[hsl(var(--color-text-primary)/0.2)]" />
            <div className="space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => onMobileOpenChange(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 text-sm",
                    isActive(item.href)
                      ? "bg-[hsl(var(--color-text-primary)/0.08)] text-[hsl(var(--color-text-primary))]"
                      : "text-[hsl(var(--color-text-secondary))]"
                  )}
                >
                  <item.icon className="size-4" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </Drawer.Content>
        </Drawer.Portal>
      </Drawer.Root>
    </>
  )
}
