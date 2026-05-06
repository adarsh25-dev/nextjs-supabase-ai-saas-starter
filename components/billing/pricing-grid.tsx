"use client"

import { useMemo, useState } from "react"
import { Check, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { trackEvent } from "@/lib/analytics/events"
import { cn } from "@/lib/utils"

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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.09, delayChildren: 0.06 },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.48, ease: [0.16, 1, 0.3, 1] as const },
  },
}

/** Matches `LandingPageClient` pricing cards: inner `motion.div` only handles hover (not variants). */
const pricingCardHover = { y: -4 }
const pricingCardHoverTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }

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
        <div className="flex justify-center">
          <div className="flex w-fit flex-wrap items-center justify-center gap-2 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.7)] p-1 shadow-[0_0_45px_-18px_hsl(var(--color-accent)/0.25)]">
            <button
              type="button"
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-[background-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                billingCycle === "monthly"
                  ? "bg-[hsl(var(--color-text-primary)/0.12)] text-[hsl(var(--color-text-primary))]"
                  : "text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-text-primary)/0.06)]"
              )}
              onClick={() => setBillingCycle("monthly")}
            >
              Monthly
            </button>
            <button
              type="button"
              className={cn(
                "rounded-full px-4 py-1.5 text-sm transition-[background-color,color] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
                billingCycle === "yearly"
                  ? "bg-[hsl(var(--color-text-primary)/0.12)] text-[hsl(var(--color-text-primary))]"
                  : "text-[hsl(var(--color-text-secondary))] hover:bg-[hsl(var(--color-text-primary)/0.06)]"
              )}
              onClick={() => setBillingCycle("yearly")}
            >
              Yearly
            </button>
            <span className="rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.8)] px-3 py-1 text-xs text-[hsl(var(--color-accent-soft))]">
              Save 20%
            </span>
          </div>
        </div>
      ) : null}

      <motion.div
        className="grid gap-6 md:grid-cols-3"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {computedPlans.map((plan) => {
          const isPopular = mode === "pricing" && plan.key === "pro"
          const isCurrent = mode === "billing" && currentTier === plan.key
          const showTopBadge = isPopular || (mode === "billing" && isCurrent)

          return (
            <motion.div key={plan.key} variants={cardVariants} className="h-full">
              <motion.div
                whileHover={pricingCardHover}
                transition={pricingCardHoverTransition}
                className={cn(
                  "gradient-border glass relative flex h-full flex-col rounded-2xl p-6",
                  isPopular && "shadow-[0_0_60px_-15px_hsl(var(--color-accent)/0.45)]",
                  isCurrent && mode === "billing" && "shadow-[0_0_48px_-18px_hsl(var(--color-accent)/0.55)]"
                )}
              >
              {showTopBadge ? (
                <span
                  className={cn(
                    "absolute -top-3 left-1/2 z-[1] -translate-x-1/2 whitespace-nowrap rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))] px-3 py-1 text-xs text-[hsl(var(--color-accent-soft))]",
                    mode === "billing" && isCurrent && !isPopular && "text-[hsl(var(--color-text-secondary))]"
                  )}
                >
                  {isPopular ? "Most popular" : "Current plan"}
                </span>
              ) : null}

              <h3
                className={cn(
                  "text-xl text-[hsl(var(--color-text-primary))]",
                  showTopBadge ? "pt-2" : undefined
                )}
              >
                {plan.name}
              </h3>

              <p className="mt-3 text-5xl leading-none text-[hsl(var(--color-text-primary))]">
                ${plan.displayPrice}
                <span className="ml-1 text-sm font-normal text-[hsl(var(--color-text-secondary))]">
                  /month
                </span>
              </p>

              <div className="my-5 h-px bg-[hsl(var(--color-border))]" />

              <ul className="grow space-y-2">
                {plan.features.map((feature) => (
                  <li
                    key={feature}
                    className="inline-flex items-center gap-2 text-sm text-[hsl(var(--color-text-secondary))]"
                  >
                    <Check className="size-4 shrink-0 text-[hsl(var(--color-accent-soft))]" aria-hidden />
                    {feature}
                  </li>
                ))}
              </ul>

              <div className="mt-6">
                {mode === "billing" && isCurrent ? (
                  <Button className="w-full rounded-xl py-2.5" variant="secondary" disabled>
                    Current plan
                  </Button>
                ) : (
                  <MagneticButton
                    variant={isPopular ? "primary" : "secondary"}
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
                  </MagneticButton>
                )}
              </div>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
