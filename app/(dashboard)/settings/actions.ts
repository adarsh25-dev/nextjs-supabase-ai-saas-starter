"use server"

import * as Sentry from "@sentry/nextjs"
import { revalidatePath } from "next/cache"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import { z } from "zod"

import { createClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe/stripe"
import type { Database } from "@/types/database"

type ActionResult = {
  ok: boolean
  message: string
}

const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
})

const changePasswordSchema = z.object({
  password: z.string().min(8).max(128),
  confirmPassword: z.string().min(8).max(128),
})

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = updateProfileSchema.safeParse({
      fullName: formData.get("fullName"),
    })

    if (!parsed.success) {
      return { ok: false, message: "Please provide a valid full name." }
    }

    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, message: "Unauthorized." }
    }

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: parsed.data.fullName })
      .eq("id", user.id)

    if (error) {
      return { ok: false, message: "Unable to update profile right now." }
    }

    revalidatePath("/settings")
    return { ok: true, message: "Profile updated." }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to update profile right now." }
  }
}

export async function changePassword(formData: FormData): Promise<ActionResult> {
  try {
    const parsed = changePasswordSchema.safeParse({
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    })

    if (!parsed.success) {
      return { ok: false, message: "Password must be at least 8 characters." }
    }

    if (parsed.data.password !== parsed.data.confirmPassword) {
      return { ok: false, message: "Passwords do not match." }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password })

    if (error) {
      return { ok: false, message: "Unable to change password." }
    }

    return { ok: true, message: "Password changed successfully." }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to change password." }
  }
}

export async function deleteAccount(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { ok: false, message: "Unauthorized." }
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!supabaseUrl || !serviceRoleKey) {
      return {
        ok: false,
        message: "Account deletion requires SUPABASE_SERVICE_ROLE_KEY in environment variables.",
      }
    }

    const { data: activeSubscription } = await supabase
      .from("subscriptions")
      .select("stripe_subscription_id, status")
      .eq("user_id", user.id)
      .in("status", ["active", "trialing", "past_due"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()

    if (activeSubscription?.stripe_subscription_id) {
      await stripe.subscriptions.cancel(activeSubscription.stripe_subscription_id)
    }

    const adminClient = createServiceClient<Database>(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const { error } = await adminClient.auth.admin.deleteUser(user.id)
    if (error) {
      return { ok: false, message: "Unable to delete account." }
    }

    await supabase.auth.signOut()
    return { ok: true, message: "Account deleted." }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to delete account." }
  }
}
