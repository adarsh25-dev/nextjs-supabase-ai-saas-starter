"use client"

import { Bell, Menu, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { cn } from "@/lib/utils"

type TopbarProps = {
  title: string
  user: { name: string; avatarUrl: string | null; email: string }
  onOpenMobileNav: () => void
}

function initialsFromName(name: string, email: string) {
  const trimmed = name.trim()
  if (!trimmed) return email.slice(0, 2).toUpperCase()
  const pieces = trimmed.split(/\s+/).slice(0, 2)
  return pieces.map((piece) => piece.charAt(0).toUpperCase()).join("")
}

export function Topbar({ title, user, onOpenMobileNav }: TopbarProps) {
  const router = useRouter()
  const [scrolled, setScrolled] = useState(false)
  const initials = initialsFromName(user.name, user.email)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[hsl(var(--color-text-primary)/0.08)] bg-black/55 px-4 backdrop-blur-xl transition-all duration-200 md:px-8",
        scrolled ? "border-[hsl(var(--color-text-primary)/0.18)] bg-black/72 backdrop-blur-2xl" : ""
      )}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="glass inline-flex size-9 items-center justify-center rounded-lg border border-[hsl(var(--color-text-primary)/0.12)] lg:hidden"
          aria-label="Open navigation menu"
        >
          <Menu className="size-4" />
        </button>
        <span className="inline-block h-6 w-1 rounded-full bg-[hsl(var(--color-accent-soft))] shadow-[0_0_12px_hsl(var(--color-accent)/0.5)]" />
        <h1 className="font-display text-xl font-medium tracking-tight text-[hsl(var(--color-text-primary))]">{title}</h1>
      </div>
      <div className="flex items-center gap-3">
        <MagneticButton
          variant="primary"
          className="h-9 px-3 text-xs md:text-sm"
          onClick={() => router.push("/chat")}
        >
          <Plus className="mr-1 size-4" /> New chat
        </MagneticButton>

        <DropdownMenu>
          <DropdownMenuTrigger className="relative glass inline-flex size-9 items-center justify-center rounded-lg border border-[hsl(var(--color-text-primary)/0.12)]">
            <Bell className="size-4" />
            <span className="absolute right-1.5 top-1.5 inline-flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-500 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
            </span>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="glass border border-[hsl(var(--color-text-primary)/0.14)]">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>No new notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <Avatar className="size-8 ring-1 ring-transparent transition-all hover:ring-[hsl(var(--color-accent-soft)/0.6)]">
          <AvatarImage src={user.avatarUrl ?? undefined} alt={user.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  )
}
