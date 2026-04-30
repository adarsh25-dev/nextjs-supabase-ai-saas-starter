"use client"

import { useMemo, useState } from "react"
import { Loader2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
}

export function PricingGrid({ plans }: PricingGridProps) {
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

      window.location.href = payload.url
    } catch (error) {
      console.error(error)
      setLoadingPlan(null)
    }
  }

  return (
    <div className="space-y-8">
      <div className="mx-auto flex w-fit items-center gap-2 rounded-lg border bg-muted p-1">
        <Button
          variant={billingCycle === "monthly" ? "default" : "ghost"}
          size="sm"
          onClick={() => setBillingCycle("monthly")}
        >
          Monthly
        </Button>
        <Button
          variant={billingCycle === "yearly" ? "default" : "ghost"}
          size="sm"
          onClick={() => setBillingCycle("yearly")}
        >
          Yearly
        </Button>
        <Badge variant="secondary">20% off yearly</Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {computedPlans.map((plan) => (
          <Card key={plan.key} className={plan.key === "pro" ? "border-primary shadow-md" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between gap-2">
                <CardTitle>{plan.name}</CardTitle>
                {plan.key === "pro" ? <Badge>Most popular</Badge> : null}
              </div>
              <div className="text-3xl font-bold">
                ${plan.displayPrice}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {plan.features.map((feature) => (
                  <li key={feature}>- {feature}</li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
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
                ) : (
                  "Subscribe"
                )}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}
