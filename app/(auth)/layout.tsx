import Link from "next/link"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-10">
        <Link href="/" className="mb-6 text-2xl font-bold tracking-tight">
          SaaS Starter
        </Link>
        <div className="w-full max-w-md">{children}</div>
      </main>
      <footer className="border-t py-4 text-center text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-4">
          <Link href="/privacy" className="hover:text-foreground">
            Privacy
          </Link>
          <span>-</span>
          <Link href="/terms" className="hover:text-foreground">
            Terms
          </Link>
        </div>
      </footer>
    </div>
  )
}
