"use server"

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
  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: input.email,
    password: input.password,
  })

  if (error) {
    return { ok: false, message: toFriendlyAuthError(error.message) }
  }

  return { ok: true }
}

export async function signupWithPassword(input: SignupInput): Promise<ActionResult> {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

  const { data, error } = await supabase.auth.signUp({
    email: input.email,
    password: input.password,
    options: {
      data: {
        full_name: input.fullName,
      },
      emailRedirectTo: `${siteUrl}/auth/callback?next=%2Fdashboard`,
    },
  })

  if (error) {
    return { ok: false, message: toFriendlyAuthError(error.message) }
  }

  if (!data.session) {
    return {
      ok: true,
      message: "Signup successful. Please check your email to confirm your account.",
    }
  }

  return { ok: true, message: "Signup successful." }
}

export async function sendMagicLink(input: MagicLinkInput): Promise<ActionResult> {
  const supabase = await createClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const redirectPath = input.redirectPath ?? "/dashboard"

  const { error } = await supabase.auth.signInWithOtp({
    email: input.email,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback?next=${encodeURIComponent(redirectPath)}`,
    },
  })

  if (error) {
    return { ok: false, message: toFriendlyAuthError(error.message) }
  }

  return { ok: true, message: "Magic link sent. Check your inbox." }
}

export async function signOut(): Promise<ActionResult> {
  const supabase = await createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { ok: false, message: "Unable to sign out. Please try again." }
  }

  return { ok: true }
}
