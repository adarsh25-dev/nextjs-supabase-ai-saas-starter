export type PlanTier = "starter" | "pro" | "business"

type PlanConfig = {
  name: string
  price: number
  priceId: string | undefined
  yearlyPriceId: string | undefined
  features: string[]
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    name: "Starter",
    price: 9,
    priceId: process.env.STRIPE_PRICE_STARTER,
    yearlyPriceId: process.env.STRIPE_PRICE_STARTER_YEARLY,
    features: ["100 AI messages/month", "basic support"],
  },
  pro: {
    name: "Pro",
    price: 29,
    priceId: process.env.STRIPE_PRICE_PRO,
    yearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
    features: ["1,000 AI messages/month", "priority support", "Gemma 4 access"],
  },
  business: {
    name: "Business",
    price: 99,
    priceId: process.env.STRIPE_PRICE_BUSINESS,
    yearlyPriceId: process.env.STRIPE_PRICE_BUSINESS_YEARLY,
    features: ["10,000 AI messages/month", "dedicated support", "team seats"],
  },
}

export const PLAN_LIMITS: Record<PlanTier | "free", number> = {
  free: 20,
  starter: 100,
  pro: 1000,
  business: 10000,
}

/** Max completion tokens per chat turn, aligned with Stripe plan tier (Gemma 4 / billing). */
export const CHAT_MAX_OUTPUT_TOKENS: Record<PlanTier | "free", number> = {
  free: 500,
  starter: 1000,
  pro: 4000,
  business: 4000,
}

const planByPrice: Array<[string, PlanTier]> = Object.entries(PLANS).flatMap(([tier, plan]) =>
  [plan.priceId, plan.yearlyPriceId]
    .filter((priceId): priceId is string => Boolean(priceId))
    .map((priceId) => [priceId, tier as PlanTier] as [string, PlanTier])
)

export const STRIPE_PRICE_TO_PLAN = new Map<string, PlanTier>(planByPrice)
