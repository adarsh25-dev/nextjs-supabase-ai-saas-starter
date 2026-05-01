import Link from "next/link"

import { AuthDecorPanel } from "@/components/auth/AuthDecorPanel"
import { Logo } from "@/components/ui/primitives/Logo"
import { AuroraBackground } from "@/components/ui/primitives/AuroraBackground"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-black text-[hsl(var(--color-text-primary))]">
      <div className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
        <AuthDecorPanel />

        <main className="relative flex flex-col justify-center px-6 py-10 lg:px-14">
          <div className="lg:hidden">
            <AuroraBackground />
          </div>
          <div className="relative z-10 mx-auto w-full max-w-md">
            <Link href="/" className="mb-8 inline-flex lg:hidden">
              <Logo size="md" />
            </Link>
            {children}
          </div>
          <div className="relative z-10 mt-10 flex items-center justify-center gap-4 border-t border-[hsl(var(--color-border)/0.65)] pt-6 text-xs text-[hsl(var(--color-text-secondary))]">
            <Link href="/privacy" className="transition-colors hover:text-[hsl(var(--color-text-primary))]">
              Privacy
            </Link>
            <span className="text-[hsl(var(--color-text-secondary)/0.55)]">•</span>
            <Link href="/terms" className="transition-colors hover:text-[hsl(var(--color-text-primary))]">
              Terms
            </Link>
          </div>
        </main>
      </div>
      <footer className="sr-only">
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
