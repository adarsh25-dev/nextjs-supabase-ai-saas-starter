"use server"

import * as Sentry from "@sentry/nextjs"
import { z } from "zod"

import { sendWelcomeEmail } from "@/lib/email/send"
import { getSiteUrl } from "@/lib/site-url"
import { createClient } from "@/lib/supabase/server"

type ActionResult = {
  ok: boolean
  message?: string
}

type LoginInput = {
  email: string
  password: string
}

type SignupInput = {
  fullName: string
  email: string
  password: string
}

type MagicLinkInput = {
  email: string
  redirectPath?: string
}

const loginInputSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

const signupInputSchema = z.object({
  fullName: z.string().trim().min(2, "Please enter your full name."),
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
})

const magicLinkInputSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  redirectPath: z.string().optional(),
})

function toFriendlyAuthError(errorMessage?: string) {
  const message = (errorMessage ?? "").toLowerCase()

  if (message.includes("invalid login credentials")) {
    return "Invalid credentials. Please check your email and password."
  }
  if (message.includes("already registered") || message.includes("user already registered")) {
    return "This email is already registered. Try logging in instead."
  }
  if (message.includes("email not confirmed")) {
    return "Please confirm your email before logging in."
  }
  return errorMessage ?? "Authentication failed. Please try again."
}

export async function loginWithPassword(input: LoginInput): Promise<ActionResult> {
  try {
    const parsedInput = loginInputSchema.safeParse(input)
    if (!parsedInput.success) {
      return { ok: false, message: parsedInput.error.issues[0]?.message ?? "Invalid login input." }
    }

    const supabase = await createClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
    })

    if (error) {
      return { ok: false, message: toFriendlyAuthError(error.message) }
    }

    return { ok: true }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to sign in right now." }
  }
}

export async function signupWithPassword(input: SignupInput): Promise<ActionResult> {
  try {
    const parsedInput = signupInputSchema.safeParse(input)
    if (!parsedInput.success) {
      return { ok: false, message: parsedInput.error.issues[0]?.message ?? "Invalid signup input." }
    }

    const supabase = await createClient()
    const siteUrl = getSiteUrl()

    const { data, error } = await supabase.auth.signUp({
      email: parsedInput.data.email,
      password: parsedInput.data.password,
      options: {
        data: {
          full_name: parsedInput.data.fullName,
        },
        emailRedirectTo: `${siteUrl}/auth/callback?next=%2Fdashboard`,
      },
    })

    if (error) {
      return { ok: false, message: toFriendlyAuthError(error.message) }
    }

    await sendWelcomeEmail(parsedInput.data.email, parsedInput.data.fullName)

    if (!data.session) {
      return {
        ok: true,
        message: "Signup successful. Please check your email to confirm your account.",
      }
    }

    return { ok: true, message: "Signup successful." }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to create account right now." }
  }
}

export async function sendMagicLink(input: MagicLinkInput): Promise<ActionResult> {
  try {
    const parsedInput = magicLinkInputSchema.safeParse(input)
    if (!parsedInput.success) {
      return { ok: false, message: parsedInput.error.issues[0]?.message ?? "Invalid magic link input." }
    }

    const supabase = await createClient()
    const siteUrl = getSiteUrl()
    const redirectPath = parsedInput.data.redirectPath ?? "/dashboard"

    const { error } = await supabase.auth.signInWithOtp({
      email: parsedInput.data.email,
      options: {
        emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
      },
    })

    if (error) {
      return { ok: false, message: toFriendlyAuthError(error.message) }
    }

    return { ok: true, message: "Magic link sent. Check your inbox." }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to send magic link right now." }
  }
}

export async function signOut(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      return { ok: false, message: "Unable to sign out. Please try again." }
    }

    return { ok: true }
  } catch (error) {
    Sentry.captureException(error)
    return { ok: false, message: "Unable to sign out right now." }
  }
}
