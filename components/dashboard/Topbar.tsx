"use client"

import { Menu, Plus } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { cn } from "@/lib/utils"

type TopbarProps = {
  title: string
  user: { name: string; avatarUrl: string | null; email: string }
  onOpenMobileNav: () => void
  /** Hide primary “New chat” CTA (e.g. on `/chat` where the sidebar already starts chats). */
  showNewChatButton?: boolean
}

function initialsFromName(name: string, email: string) {
  const trimmed = name.trim()
  if (!trimmed) return email.slice(0, 2).toUpperCase()
  const pieces = trimmed.split(/\s+/).slice(0, 2)
  return pieces.map((piece) => piece.charAt(0).toUpperCase()).join("")
}

export function Topbar({
  title,
  user,
  onOpenMobileNav,
  showNewChatButton = true,
}: TopbarProps) {
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
        {showNewChatButton ? (
          <MagneticButton
            variant="primary"
            className="h-9 px-3 text-xs md:text-sm"
            onClick={() => router.push("/chat")}
          >
            <Plus className="mr-1 size-4" /> New chat
          </MagneticButton>
        ) : null}

        <Link
          href="/settings"
          className="rounded-full outline-none ring-offset-2 ring-offset-[hsl(var(--color-bg))] transition-[box-shadow] hover:ring-2 hover:ring-[hsl(var(--color-accent-soft)/0.5)] focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))]"
          aria-label="Account settings"
        >
          <Avatar className="size-8">
            <AvatarImage src={user.avatarUrl ?? undefined} alt="" />
            <AvatarFallback aria-hidden>{initials}</AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </header>
  )
}
