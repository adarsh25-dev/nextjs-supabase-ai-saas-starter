import dynamic from "next/dynamic"
import Link from "next/link"

import { Button } from "@/components/ui/button"

const MobileNavSheet = dynamic(
  () => import("@/app/(marketing)/_components/mobile-nav-sheet").then((mod) => mod.MobileNavSheet),
  { ssr: false }
)

const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "#" },
  { label: "Blog", href: "#" },
]

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-slate-50/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          SaaS Starter
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button className="bg-purple-600 hover:bg-purple-700" asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>

        <MobileNavSheet navLinks={navLinks} />
      </div>
    </header>
  )
}
