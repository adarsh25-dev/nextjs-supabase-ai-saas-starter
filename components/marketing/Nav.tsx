"use client"

import { Drawer } from "vaul"
import { Menu, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

import { Logo } from "@/components/ui/primitives/Logo"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
]

export function Nav() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 80)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className="sticky top-0 z-40">
      <div
        className={cn(
          "relative transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          isScrolled ? "glass border-b border-[hsl(var(--color-border)/0.8)]" : "bg-transparent"
        )}
      >
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4">
          <Logo size="md" />

          <nav className="hidden items-center gap-7 lg:flex">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                className="bg-[linear-gradient(currentColor,currentColor)] bg-[length:0%_1px] bg-[position:0_100%] bg-no-repeat text-sm text-[hsl(var(--color-text-secondary))] transition-[color,background-size] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-[length:100%_1px] hover:text-[hsl(var(--color-text-primary))]"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            <MagneticButton
              variant="ghost"
              className="px-3 py-2"
              onClick={() => (window.location.href = "/login")}
            >
              Sign in
            </MagneticButton>
            <MagneticButton
              variant="primary"
              className="px-4 py-2 shadow-[0_0_52px_-16px_hsl(var(--color-accent)/0.6)]"
              onClick={() => (window.location.href = "/signup")}
            >
              Get started
            </MagneticButton>
          </div>

          <Drawer.Root open={mobileOpen} onOpenChange={setMobileOpen}>
            <Drawer.Trigger asChild>
              <button
                type="button"
                aria-label="Open navigation menu"
                className="inline-flex size-10 items-center justify-center rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-primary))] lg:hidden"
              >
                <Menu className="size-4" />
              </button>
            </Drawer.Trigger>
            <Drawer.Portal>
              <Drawer.Overlay className="fixed inset-0 z-40 bg-black/55" />
              <Drawer.Content className="glass fixed inset-x-0 bottom-0 z-50 rounded-t-3xl border border-[hsl(var(--color-border))] p-6 outline-none">
                <div className="mx-auto mb-5 h-1.5 w-14 rounded-full bg-[hsl(var(--color-border))]" />
                <div className="mb-6 flex items-center justify-between">
                  <Logo size="sm" />
                  <button
                    type="button"
                    aria-label="Close navigation menu"
                    className="inline-flex size-8 items-center justify-center rounded-lg border border-[hsl(var(--color-border))]"
                    onClick={() => setMobileOpen(false)}
                  >
                    <X className="size-4" />
                  </button>
                </div>
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.label}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="rounded-xl px-3 py-3 text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-elevated))]"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <div className="mt-6 grid grid-cols-2 gap-2">
                  <MagneticButton
                    variant="ghost"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false)
                      window.location.href = "/login"
                    }}
                  >
                    Sign in
                  </MagneticButton>
                  <MagneticButton
                    variant="primary"
                    className="w-full"
                    onClick={() => {
                      setMobileOpen(false)
                      window.location.href = "/signup"
                    }}
                  >
                    Get started
                  </MagneticButton>
                </div>
              </Drawer.Content>
            </Drawer.Portal>
          </Drawer.Root>
        </div>
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px overflow-hidden">
          <div className="h-px w-full animate-[shimmer_8s_linear_infinite] bg-[linear-gradient(90deg,transparent,hsl(var(--color-accent)/0.4),hsl(var(--color-accent-soft)/0.4),transparent)] bg-[length:200%_100%]" />
        </div>
      </div>
    </header>
  )
}
