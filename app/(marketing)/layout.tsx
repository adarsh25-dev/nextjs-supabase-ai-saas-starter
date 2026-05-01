import type { Metadata } from "next"

import { ClientLayout } from "@/components/layout/client-layout"
import { AuroraBackground } from "@/components/ui/primitives/AuroraBackground"
import { NoiseLayer } from "@/components/ui/primitives/NoiseLayer"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  openGraph: {
    title: "SaaS Starter",
    description: "Production-ready starter for AI SaaS apps.",
    type: "website",
    url: siteUrl,
    images: [{ url: `/api/og?title=${encodeURIComponent("SaaS Starter")}` }],
  },
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClientLayout>
      <div className="relative min-h-screen bg-[hsl(var(--color-bg))] text-[hsl(var(--color-text-primary))]">
        <AuroraBackground />
        <NoiseLayer />
        <div className="relative z-10">{children}</div>
      </div>
    </ClientLayout>
  )
}
