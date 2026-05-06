import * as Sentry from "@sentry/nextjs"
import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import Stripe from "stripe"

import {
  sendSubscriptionCanceledEmail,
  sendSubscriptionConfirmationEmail,
} from "@/lib/email/send"
import type { Database } from "@/types/database"
import { STRIPE_PRICE_TO_PLAN, type PlanTier } from "@/lib/stripe/config"
import { stripe } from "@/lib/stripe/stripe"

const stripeStatusMap: Record<string, Database["public"]["Tables"]["subscriptions"]["Row"]["status"]> = {
  active: "active",
  trialing: "trialing",
  past_due: "past_due",
  canceled: "canceled",
  incomplete: "incomplete",
  incomplete_expired: "incomplete",
  unpaid: "past_due",
  paused: "past_due",
}

function toSubscriptionStatus(
  status: string
): Database["public"]["Tables"]["subscriptions"]["Row"]["status"] {
  return stripeStatusMap[status] ?? "incomplete"
}

function toPlanTier(priceId: string | null | undefined): PlanTier | "free" {
  if (!priceId) return "free"
  return STRIPE_PRICE_TO_PLAN.get(priceId) ?? "free"
}

function planLabel(tier: PlanTier | "free") {
  return tier.charAt(0).toUpperCase() + tier.slice(1)
}

function getSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceRole) {
    throw new Error("Missing Supabase URL or service role key for webhook writes.")
  }

  return createClient<Database>(url, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

async function resolveUserIdFromCustomer(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  customerId: string
) {
  const { data: subscriptionRow } = await supabaseAdmin
    .from("subscriptions")
    .select("user_id")
    .eq("stripe_customer_id", customerId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionRow?.user_id) return subscriptionRow.user_id

  const customer = await stripe.customers.retrieve(customerId)
  if (!("deleted" in customer) && customer.metadata?.supabase_user_id) {
    return customer.metadata.supabase_user_id
  }

  return null
}

async function upsertSubscriptionFromStripe(
  supabaseAdmin: ReturnType<typeof getSupabaseAdminClient>,
  params: {
    userId: string
    customerId: string | null
    subscriptionId: string
    priceId: string | null
    status: string
    currentPeriodEnd: number | null
  }
) {
  const normalizedStatus = toSubscriptionStatus(params.status)
  const planTier = toPlanTier(params.priceId)

  const { error } = await supabaseAdmin.from("subscriptions").upsert(
    {
      user_id: params.userId,
      stripe_customer_id: params.customerId,
      stripe_subscription_id: params.subscriptionId,
      stripe_price_id: params.priceId,
      status: normalizedStatus,
      plan_tier: planTier,
      current_period_end: params.currentPeriodEnd
        ? new Date(params.currentPeriodEnd * 1000).toISOString()
        : null,
    },
    {
      onConflict: "stripe_subscription_id",
    }
  )

  if (error) {
    throw error
  }
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    return NextResponse.json({ error: "Missing STRIPE_WEBHOOK_SECRET" }, { status: 500 })
  }

  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature header" }, { status: 400 })
  }

  const payload = await request.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    Sentry.captureException(error)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
  }

  try {
    const supabaseAdmin = getSupabaseAdminClient()
    const { data: existingWebhookEvent } = await supabaseAdmin
      .from("stripe_webhook_events")
      .select("id")
      .eq("event_id", event.id)
      .maybeSingle()

    if (existingWebhookEvent) {
      return NextResponse.json({ received: true, duplicate: true })
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        if (session.mode !== "subscription") break

        const subscriptionId =
          typeof session.subscription === "string" ? session.subscription : session.subscription?.id
        const customerId =
          typeof session.customer === "string" ? session.customer : session.customer?.id ?? null

        if (!subscriptionId || !customerId) break

        const subscription = (await stripe.subscriptions.retrieve(
          subscriptionId
        )) as unknown as Stripe.Subscription
        const priceId = subscription.items.data[0]?.price?.id ?? null
        const userId =
          session.client_reference_id ??
          session.metadata?.supabase_user_id ??
          (await resolveUserIdFromCustomer(supabaseAdmin, customerId))

        if (!userId) break

        await upsertSubscriptionFromStripe(supabaseAdmin, {
          userId,
          customerId,
          subscriptionId: subscription.id,
          priceId,
          status: subscription.status,
          currentPeriodEnd: (subscription as unknown as { current_period_end?: number })
            .current_period_end ?? null,
        })

        const tier = toPlanTier(priceId)
        const receiptEmail =
          session.customer_details?.email ||
          (typeof session.customer_email === "string" ? session.customer_email : null)
        if (receiptEmail) {
          await sendSubscriptionConfirmationEmail(receiptEmail, planLabel(tier))
        }

        break
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription
        const customerId =
          typeof subscription.customer === "string"
            ? subscription.customer
            : subscription.customer?.id ?? null
        if (!customerId) break

        const userId = await resolveUserIdFromCustomer(supabaseAdmin, customerId)
        if (!userId) break

        const priceId = subscription.items.data[0]?.price?.id ?? null
        await upsertSubscriptionFromStripe(supabaseAdmin, {
          userId,
          customerId,
          subscriptionId: subscription.id,
          priceId,
          status:
            event.type === "customer.subscription.deleted"
              ? "canceled"
              : subscription.status,
          currentPeriodEnd: (subscription as unknown as { current_period_end?: number })
            .current_period_end ?? null,
        })

        if (event.type === "customer.subscription.deleted") {
          const customer = await stripe.customers.retrieve(customerId)
          const email = !("deleted" in customer) ? customer.email : null
          if (email) {
            await sendSubscriptionCanceledEmail(email)
          }
        }

        break
      }

      case "invoice.payment_succeeded":
      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice
        const invoiceSubscription = (
          invoice as unknown as { subscription?: string | { id?: string } | null }
        ).subscription
        const subscriptionId =
          typeof invoiceSubscription === "string"
            ? invoiceSubscription
            : invoiceSubscription?.id ?? null
        if (!subscriptionId) break

        const status = event.type === "invoice.payment_succeeded" ? "active" : "past_due"

        const { error } = await supabaseAdmin
          .from("subscriptions")
          .update({ status })
          .eq("stripe_subscription_id", subscriptionId)

        if (error) throw error
        break
      }

      default:
        break
    }

    const { error: webhookInsertError } = await supabaseAdmin
      .from("stripe_webhook_events")
      .insert({
        event_id: event.id,
        event_type: event.type,
      })
    if (webhookInsertError?.code !== "23505" && webhookInsertError) {
      throw webhookInsertError
    }
  } catch (error) {
    Sentry.captureException(error)
    console.error("[stripe-webhook]", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
