import { NextResponse } from "next/server"
import { z } from "zod"

import { createClient as createSupabaseClient } from "@/lib/supabase/server"
import { STRIPE_PRICE_TO_PLAN } from "@/lib/stripe/config"
import { stripe } from "@/lib/stripe/stripe"

const checkoutBodySchema = z.object({
  priceId: z.string().min(1),
})

export async function POST(request: Request) {
  const supabase = await createSupabaseClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const parsed = checkoutBodySchema.safeParse(await request.json())
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const { priceId } = parsed.data
  const planTier = STRIPE_PRICE_TO_PLAN.get(priceId)
  if (!planTier) {
    return NextResponse.json({ error: "Invalid price ID" }, { status: 400 })
  }

  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("stripe_customer_id")
    .eq("user_id", user.id)
    .not("stripe_customer_id", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  let customerId = existingSubscription?.stripe_customer_id ?? null

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: {
        supabase_user_id: user.id,
      },
    })
    customerId = customer.id
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(request.url).origin
  const successUrl = `${siteUrl}/dashboard/billing?success=1`
  const cancelUrl = `${siteUrl}/pricing?canceled=1`

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    client_reference_id: user.id,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    allow_promotion_codes: true,
    metadata: {
      supabase_user_id: user.id,
      plan_tier: planTier,
    },
  })

  if (!session.url) {
    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    )
  }

  return NextResponse.json({ url: session.url })
}
