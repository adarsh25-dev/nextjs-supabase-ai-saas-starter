import type { Metadata } from "next"

import { ClientLayout } from "@/components/layout/client-layout"
import { AuroraBackground } from "@/components/ui/primitives/AuroraBackground"
import { NoiseLayer } from "@/components/ui/primitives/NoiseLayer"
import { BRAND_NAME, BRAND_TAGLINE, ogImageUrl } from "@/lib/brand"
import { getSiteUrl } from "@/lib/site-url"

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  openGraph: {
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    type: "website",
    url: siteUrl,
    images: [{ url: ogImageUrl() }],
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
