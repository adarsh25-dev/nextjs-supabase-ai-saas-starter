"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useMemo, useTransition } from "react"
import { CreditCard, Home, MessageSquare, Plus, Settings } from "lucide-react"
import { toast } from "sonner"

import { signOut } from "@/app/(auth)/actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

type ShellUser = {
  name: string
  email: string
  avatarUrl: string | null
}

type DashboardShellProps = {
  children: React.ReactNode
  user: ShellUser
  planTier: "free" | "starter" | "pro" | "business"
}

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/dashboard/chat", label: "Chat", icon: MessageSquare },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
]

function initialsFromName(name: string, email: string) {
  const trimmed = name.trim()
  if (!trimmed) return email.slice(0, 2).toUpperCase()
  const pieces = trimmed.split(/\s+/).slice(0, 2)
  return pieces.map((piece) => piece.charAt(0).toUpperCase()).join("")
}

function titleFromPath(pathname: string) {
  if (pathname === "/dashboard") return "Dashboard"
  if (pathname.startsWith("/dashboard/chat")) return "Chat"
  if (pathname.startsWith("/dashboard/settings")) return "Settings"
  if (pathname.startsWith("/dashboard/billing")) return "Billing"
  return "Dashboard"
}

export function DashboardShell({ children, user, planTier }: DashboardShellProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [isSigningOut, startSignOut] = useTransition()

  const pageTitle = useMemo(() => titleFromPath(pathname), [pathname])
  const initials = useMemo(() => initialsFromName(user.name, user.email), [user.name, user.email])

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
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader className="border-b">
          <Link href="/dashboard" className="px-2 py-1 text-sm font-semibold tracking-tight">
            SaaS Starter
          </Link>
          <p className="px-2 text-xs text-muted-foreground">Plan: {planTier}</p>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {navItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild isActive={pathname === item.href || pathname.startsWith(`${item.href}/`)}>
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="border-t">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-auto w-full justify-start gap-2 px-2 py-2">
                <Avatar size="sm">
                  <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/billing">Billing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={handleSignOut} disabled={isSigningOut}>
                {isSigningOut ? "Signing out..." : "Sign out"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-16 items-center justify-between border-b px-4">
          <div className="flex items-center gap-2">
                    <SidebarTrigger aria-label="Toggle sidebar" />
            <h1 className="text-lg font-semibold">{pageTitle}</h1>
          </div>
          <Button size="sm" asChild>
            <Link href="/dashboard/chat">
              <Plus className="size-4" />
              New chat
            </Link>
          </Button>
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}
