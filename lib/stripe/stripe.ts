import Stripe from "stripe"

const stripeSecretKey = process.env.STRIPE_SECRET_KEY?.trim() || "sk_test_placeholder"

export const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2024-10-28.acacia" as any,
  appInfo: {
    name: "LaunchForge",
  },
})
