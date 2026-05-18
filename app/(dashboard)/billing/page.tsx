import type { Metadata } from "next"

import { brandSectionTitle } from "@/lib/brand"
import Link from "next/link"

import { BillingEvents } from "@/components/billing/billing-events"
import { ManageSubscriptionButton } from "@/components/billing/manage-subscription-button"
import { PricingGrid } from "@/components/billing/pricing-grid"
import { UsageMeter } from "@/components/billing/usage-meter"
import { Badge } from "@/components/ui/badge"
import { getSubscription } from "@/lib/billing/get-subscription"
import { PLANS } from "@/lib/stripe/config"

export const metadata: Metadata = {
  title: brandSectionTitle("Billing"),
  description: "Manage your plan, monitor usage, and update subscription details.",
}

export default async function BillingPage() {
  const subscription = await getSubscription()

  const planLabel = subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)
  const renewalDate = subscription.renewalDate
    ? new Date(subscription.renewalDate).toLocaleDateString()
    : "N/A"
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
  const invoices: Array<{ date: string; amount: string; status: "paid" | "failed" | "pending"; receipt?: string }> = []

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <BillingEvents />
      <div>
        <h1 className="font-display text-3xl text-[hsl(var(--color-text-primary))]">Billing & Plans</h1>
        <p className="mt-1 text-sm text-[hsl(var(--color-text-secondary))]">
          Track usage, manage your current plan, and review invoices.
        </p>
      </div>

      <section className="gradient-border relative overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-8">
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(80%_100%_at_80%_10%,hsl(var(--color-accent)/0.15),transparent_55%)]" />
        <div className="relative grid gap-6 md:grid-cols-2">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <h2 className="font-display text-3xl text-[hsl(var(--color-text-primary))]">{planLabel}</h2>
              <Badge variant={subscription.isActive ? "default" : "secondary"}>{subscription.status}</Badge>
            </div>
            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              {subscription.status === "canceled" ? "Canceled" : `Renews on ${renewalDate}`}
            </p>
          </div>
          <div className="flex items-start justify-end">
            <ManageSubscriptionButton />
          </div>
        </div>
      </section>

      <section className="glass rounded-2xl border border-[hsl(var(--color-border))] p-6">
        <h3 className="font-display text-xl">Usage this month</h3>
        <p className="mb-3 mt-1 text-sm text-[hsl(var(--color-text-secondary))]">
          {subscription.usage.toLocaleString()} of {subscription.limit.toLocaleString()} messages used.
        </p>
        <UsageMeter used={subscription.usage} limit={subscription.limit} />
        <p className="mt-2 text-xs text-[hsl(var(--color-text-secondary))]">Usage resets on your next billing cycle.</p>
      </section>

      <section className="space-y-4">
        <h3 className="font-display text-xl">Compare and switch plans</h3>
        <PricingGrid plans={plans} mode="billing" currentTier={subscription.tier} />
      </section>

      <section className="glass rounded-2xl border border-[hsl(var(--color-border))] p-6">
        <h3 className="font-display text-xl">Invoice history</h3>
        {invoices.length === 0 ? (
          <div className="mt-4 rounded-xl border border-dashed border-[hsl(var(--color-border))] p-6 text-sm text-[hsl(var(--color-text-secondary))]">
            No invoices yet.
          </div>
        ) : (
          <div className="mt-4 overflow-hidden rounded-xl border border-[hsl(var(--color-border))]">
            <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr] border-b border-[hsl(var(--color-border))] px-4 py-3 text-xs uppercase tracking-[0.12em] text-[hsl(var(--color-text-secondary))]">
              <p>Date</p>
              <p>Amount</p>
              <p>Status</p>
              <p>Receipt</p>
            </div>
            {invoices.map((invoice) => (
              <div
                key={`${invoice.date}-${invoice.amount}`}
                className="grid grid-cols-[1.2fr_1fr_1fr_1fr] items-center px-4 py-3 text-sm hover:bg-[hsl(var(--color-text-primary)/0.04)]"
              >
                <p>{invoice.date}</p>
                <p>{invoice.amount}</p>
                <p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-xs ${
                      invoice.status === "paid"
                        ? "border-[hsl(84_22%_63%/0.24)] bg-[hsl(84_22%_63%/0.12)] text-[hsl(84_22%_63%)]"
                        : invoice.status === "failed"
                          ? "border-[hsl(4_41%_53%/0.24)] bg-[hsl(4_41%_53%/0.12)] text-[hsl(4_41%_53%)]"
                          : "border-[hsl(32_47%_61%/0.24)] bg-[hsl(32_47%_61%/0.12)] text-[hsl(32_47%_61%)]"
                    }`}
                  >
                    {invoice.status}
                  </span>
                </p>
                <p>
                  {invoice.receipt ? (
                    <Link href={invoice.receipt} className="text-[hsl(var(--color-accent-soft))]">
                      Receipt
                    </Link>
                  ) : (
                    "—"
                  )}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
