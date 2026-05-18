import type { Metadata } from "next"
import { LandingPageClient } from "@/components/marketing/LandingPageClient"
import { BRAND_NAME, BRAND_TAGLINE, ogImageUrl } from "@/lib/brand"
import { getChatCodeLines } from "@/lib/marketing/get-chat-code-lines"
import { getSiteUrl } from "@/lib/site-url"
import { PLANS } from "@/lib/stripe/config"

const GITHUB_URL = "https://github.com/adarshparmar/nextjs-supabase-ai-saas-starter"
const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  title: { absolute: BRAND_NAME },
  description: BRAND_TAGLINE,
  openGraph: {
    title: BRAND_NAME,
    description: BRAND_TAGLINE,
    type: "website",
    url: siteUrl,
    images: [{ url: ogImageUrl() }],
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
              name: BRAND_NAME,
              url: siteUrl,
              sameAs: [GITHUB_URL],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: BRAND_NAME,
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
