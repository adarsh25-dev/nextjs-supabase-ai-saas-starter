"use client"

import { AnimatePresence, motion } from "framer-motion"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useState, useTransition } from "react"
import { CreditCard, Home, MessageSquare, Settings } from "lucide-react"
import { toast } from "sonner"

import { signOut } from "@/app/(auth)/actions"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Topbar } from "@/components/dashboard/Topbar"
import { CommandPalette } from "@/components/ui/primitives/CommandPalette"
import { cn } from "@/lib/utils"

type ShellUser = {
  name: string
  email: string
  avatarUrl: string | null
}

type DashboardShellProps = {
  children: React.ReactNode
  user: ShellUser
  planTier: "free" | "starter" | "pro" | "business"
  recentSessions: Array<{ id: string; title: string; created_at: string }>
}

export type DashboardNavItem = {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
}

const navItems: DashboardNavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/chat", label: "Chat", icon: MessageSquare },
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/billing", label: "Billing", icon: CreditCard },
]

function titleFromPath(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname.startsWith("/chat")) return "Chat"
  if (pathname.startsWith("/settings")) return "Settings"
  if (pathname.startsWith("/billing")) return "Billing"
  return "Dashboard"
}

export function DashboardShell({ children, user, planTier, recentSessions }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, startSignOut] = useTransition()
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const pageTitle = useMemo(() => titleFromPath(pathname), [pathname])
  const isChatRoute = pathname.startsWith("/chat")

  const handleSignOut = () => {
    startSignOut(async () => {
      const result = await signOut()
      if (!result.ok) {
        toast.error(result.message ?? "Unable to sign out")
        return
      }
      toast.success("Signed out")
      router.push("/login")
      router.refresh()
    })
  }

  return (
    <div className="min-h-screen bg-black text-[hsl(var(--color-text-primary))]">
      <CommandPalette
        recentSessions={recentSessions}
        navItems={navItems}
        accountActions={[
          { id: "go-settings", label: "Open settings", href: "/settings" },
          { id: "go-billing", label: "Open billing", href: "/billing" },
          { id: "logout", label: isSigningOut ? "Signing out..." : "Sign out", action: handleSignOut },
        ]}
      />
      <div
        className={cn(
          "min-h-screen transition-[grid-template-columns] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:grid",
          sidebarCollapsed ? "lg:grid-cols-[64px_1fr]" : "lg:grid-cols-[260px_1fr]"
        )}
      >
        <Sidebar
          pathname={pathname}
          user={user}
          planTier={planTier}
          navItems={navItems}
          recentSessions={recentSessions}
          onSignOut={handleSignOut}
          isSigningOut={isSigningOut}
          mobileOpen={mobileNavOpen}
          onMobileOpenChange={setMobileNavOpen}
          collapsed={sidebarCollapsed}
          onCollapsedChange={setSidebarCollapsed}
        />
        <div className="relative flex min-h-screen flex-col">
          <Topbar title={pageTitle} user={user} onOpenMobileNav={() => setMobileNavOpen(true)} />
          <main
            className={cn(
              "w-full flex-1",
              isChatRoute ? "p-0" : "px-4 py-4 md:px-8 md:py-6",
              isChatRoute ? "max-w-none" : "mx-auto max-w-7xl"
            )}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={pathname}
                layout
                      initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>
      </div>
    </div>
  )
}
