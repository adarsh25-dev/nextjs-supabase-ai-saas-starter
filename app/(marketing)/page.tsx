import type { Metadata } from "next"
import { LandingPageClient } from "@/components/marketing/LandingPageClient"
import { getChatCodeLines } from "@/lib/marketing/get-chat-code-lines"
import { PLANS } from "@/lib/stripe/config"

const GITHUB_URL = "https://github.com/adarshparmar/nextjs-supabase-ai-saas-starter"
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "Home — SaaS Starter",
  description: "Ship your AI SaaS in days with a production-ready Next.js starter.",
  openGraph: {
    title: "The Next.js + Supabase SaaS starter for AI products",
    description: "Ship your AI SaaS in days with auth, billing, AI chat, and dashboard.",
    type: "website",
    url: siteUrl,
    images: [{ url: `/api/og?title=${encodeURIComponent("Next.js + Supabase SaaS starter")}` }],
  },
}

export default async function MarketingHomePage() {
  const plans = (Object.entries(PLANS) as Array<[keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]]>).map(
    ([key, plan]) => ({
      key,
      name: plan.name,
      price: plan.price,
      features: plan.features,
    })
  )
  const codeLines = await getChatCodeLines()

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "SaaS Starter",
              url: siteUrl,
              sameAs: [GITHUB_URL],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "SaaS Starter",
              url: siteUrl,
              potentialAction: {
                "@type": "SearchAction",
                target: `${siteUrl}/?q={search_term_string}`,
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />
      <LandingPageClient plans={plans} codeLines={codeLines} />
    </>
  )
}
