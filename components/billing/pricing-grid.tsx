"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { trackEvent } from "@/lib/analytics/events"

type Plan = {
  key: "starter" | "pro" | "business"
  name: string
  price: number
  priceId: string | null
  yearlyPriceId: string | null
  features: string[]
}

type PricingGridProps = {
  plans: Plan[]
  currentTier?: "free" | "starter" | "pro" | "business"
  mode?: "pricing" | "billing"
}

export function PricingGrid({ plans, currentTier, mode = "pricing" }: PricingGridProps) {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly")
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null)

  const yearlyMultiplier = 0.8

  const computedPlans = useMemo(
    () =>
      plans.map((plan) => ({
        ...plan,
        displayPrice:
          billingCycle === "yearly"
            ? Number((plan.price * yearlyMultiplier).toFixed(2))
            : plan.price,
        checkoutPriceId:
          billingCycle === "yearly"
            ? plan.yearlyPriceId ?? plan.priceId
            : plan.priceId,
      })),
    [billingCycle, plans]
  )

  const subscribe = async (planKey: string, priceId: string | null) => {
    if (!priceId) return
    setLoadingPlan(planKey)

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ priceId }),
      })

      const payload = await response.json()

      if (response.status === 401) {
        window.location.href = "/login?next=/pricing"
        return
      }

      if (!response.ok || !payload.url) {
        throw new Error(payload.error ?? "Unable to create checkout session")
      }

      trackEvent("plan_subscribed", { plan: planKey, billingCycle })
      window.location.href = payload.url
    } catch (error) {
      console.error(error)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-8">
      {mode === "pricing" ? (
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-1">
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              billingCycle === "monthly"
                ? "bg-[hsl(var(--color-text-primary)/0.12)] text-[hsl(var(--color-text-primary))]"
                : "text-[hsl(var(--color-text-secondary))]"
            }`}
            onClick={() => setBillingCycle("monthly")}
          >
            Monthly
          </button>
          <button
            type="button"
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              billingCycle === "yearly"
                ? "bg-[hsl(var(--color-text-primary)/0.12)] text-[hsl(var(--color-text-primary))]"
                : "text-[hsl(var(--color-text-secondary))]"
            }`}
            onClick={() => setBillingCycle("yearly")}
          >
            Yearly
          </button>
          <Badge className="bg-[hsl(var(--color-accent)/0.2)] text-[hsl(var(--color-accent-soft))]">Save 20%</Badge>
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-3">
        {computedPlans.map((plan) => (
          <Card
            key={plan.key}
            className={`gradient-border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] ${
              currentTier === plan.key ? "shadow-[0_0_35px_-16px_hsl(var(--color-accent)/0.7)]" : ""
            }`}
          >
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="font-display">{plan.name}</CardTitle>
                {mode === "pricing" && plan.key === "pro" ? (
                  <Badge className="bg-[hsl(var(--color-accent)/0.2)] text-[hsl(var(--color-accent-soft))]">Most popular</Badge>
                ) : null}
                {mode === "billing" && currentTier === plan.key ? (
                  <Badge className="bg-[hsl(var(--color-accent)/0.2)] text-[hsl(var(--color-accent-soft))]">Current plan</Badge>
                ) : null}
              </div>
              <div className="font-display text-3xl font-bold text-[hsl(var(--color-text-primary))]">
                ${plan.displayPrice}
                <span className="ml-1 text-sm font-normal text-[hsl(var(--color-text-secondary))]">
                  /month
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-[hsl(var(--color-text-secondary))]">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {mode === "billing" && currentTier === plan.key ? (
                <Button className="w-full" variant="secondary" disabled>
                  Current plan
                </Button>
              ) : (
                <Button
                  className="w-full"
                  disabled={!plan.checkoutPriceId || loadingPlan === plan.key}
                  onClick={() => subscribe(plan.key, plan.checkoutPriceId)}
                >
                  {loadingPlan === plan.key ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Redirecting...
                    </>
                  ) : mode === "billing" ? (
                    `Switch to ${plan.name}`
                  ) : (
                    "Subscribe"
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
