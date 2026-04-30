import type { Metadata } from "next"

import { PricingGrid } from "@/components/billing/pricing-grid"
import { PLANS } from "@/lib/stripe/config"

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"

export const metadata: Metadata = {
  title: "Pricing — SaaS Starter",
  description: "Simple pricing plans to scale your AI SaaS from idea to production.",
  openGraph: {
    title: "Pricing — SaaS Starter",
    description: "Simple pricing plans to scale your AI SaaS from idea to production.",
    type: "website",
    url: `${siteUrl}/pricing`,
    images: [{ url: `/api/og?title=${encodeURIComponent("SaaS Starter Pricing")}` }],
  },
}

export default function PricingPage() {
  const plans = (Object.entries(PLANS) as Array<[keyof typeof PLANS, (typeof PLANS)[keyof typeof PLANS]]>).map(
    ([key, plan]) => ({
      key,
      name: plan.name,
      price: plan.price,
      priceId: plan.priceId ?? null,
      yearlyPriceId: plan.yearlyPriceId ?? null,
      features: plan.features,
    })
  )

  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Simple pricing for every stage</h1>
        <p className="mt-3 text-muted-foreground">
          Choose a plan and scale your AI workflow when you are ready.
        </p>
      </div>
      <PricingGrid plans={plans} />
    </div>
  )
}
