import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Docs — SaaS Starter",
  description: "Quick documentation entry point for the SaaS Starter kit.",
}

export default function DocsPage() {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Documentation</h1>
      <p className="mt-3 text-muted-foreground">
        Full docs are coming soon. For now, use the README quick start and project source.
      </p>
    </div>
  )
}
