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
        <h1 className="font-display text-4xl tracking-tight text-[hsl(var(--color-text-primary))]">
          Simple, transparent pricing
        </h1>
        <p className="mt-3 text-[hsl(var(--color-text-secondary))]">
          Choose a plan and scale your AI workflow with predictable costs.
        </p>
      </div>
      <PricingGrid plans={plans} />

      <section className="mt-12">
        <h2 className="mb-4 font-display text-2xl text-[hsl(var(--color-text-primary))]">Compare plans</h2>
        <div className="overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))]">
          <div className="grid grid-cols-4 border-b border-[hsl(var(--color-border))] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[hsl(var(--color-text-secondary))]">
            <p>Feature</p>
            <p>Starter</p>
            <p>Pro</p>
            <p>Business</p>
          </div>
          {[
            ["Messages / month", "100", "1,000", "10,000"],
            ["Priority support", "—", "Yes", "Yes"],
            ["Gemma 4 access", "—", "Yes", "Yes"],
            ["Team seats", "—", "—", "Yes"],
          ].map((row) => (
            <div
              key={row[0]}
              className="grid grid-cols-4 items-center px-4 py-3 text-sm text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-text-primary)/0.04)]"
            >
              <p className="text-[hsl(var(--color-text-secondary))]">{row[0]}</p>
              <p>{row[1]}</p>
              <p>{row[2]}</p>
              <p>{row[3]}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12 space-y-3">
        <h2 className="font-display text-2xl text-[hsl(var(--color-text-primary))]">FAQ</h2>
        {[
          {
            q: "Can I switch plans later?",
            a: "Yes, you can switch plans anytime from your billing dashboard.",
          },
          {
            q: "Do you offer yearly billing?",
            a: "Yes, yearly billing is available with a 20% discount.",
          },
          {
            q: "What happens if I exceed usage?",
            a: "You can upgrade your plan instantly to unlock higher monthly limits.",
          },
        ].map((faq) => (
          <div key={faq.q} className="glass rounded-2xl border border-[hsl(var(--color-border))] p-4">
            <p className="text-[hsl(var(--color-text-primary))]">{faq.q}</p>
            <p className="mt-1 text-sm text-[hsl(var(--color-text-secondary))]">{faq.a}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
