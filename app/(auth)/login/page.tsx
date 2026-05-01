"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthHeading } from "@/components/auth/AuthHeading"
import { AuthInput } from "@/components/auth/AuthInput"
import { GoogleButton } from "@/components/auth/google-button"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { loginWithPassword } from "@/app/(auth)/actions"
import { trackEvent } from "@/lib/analytics/events"

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      const result = await loginWithPassword(values)

      if (!result.ok) {
        toast.error(result.message ?? "Unable to sign in")
        return
      }

      const nextPath = new URLSearchParams(window.location.search).get("next") ?? "/dashboard"
      toast.success("Logged in successfully")
      trackEvent("login", { method: "password" })
      router.push(nextPath)
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="space-y-6 animate-[hero-fade-up_460ms_cubic-bezier(0.16,1,0.3,1)_both]">
      <AuthHeading title="Welcome back" description="Sign in to your account" />

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "50ms" }}>
          <GoogleButton />
        </div>

        <div
          className="relative py-2"
          style={{ animationDelay: "80ms" }}
        >
          <div className="h-px w-full bg-[hsl(var(--color-text-primary)/0.08)]" />
          <span className="absolute left-1/2 top-2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[hsl(var(--color-text-primary)/0.16)] bg-black px-2 py-0.5 text-[10px] text-[hsl(var(--color-text-secondary))]">
            OR
          </span>
        </div>

        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "120ms" }}>
          <AuthInput
            id="email"
            label="Email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            error={form.formState.errors.email?.message}
            {...form.register("email")}
          />
        </div>

        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "160ms" }}>
          <AuthInput
            id="password"
            label="Password"
            type="password"
            autoComplete="current-password"
            placeholder="Enter password"
            showTogglePassword
            error={form.formState.errors.password?.message}
            {...form.register("password")}
          />
        </div>

        <div
          className="flex justify-end"
          style={{ animationDelay: "200ms" }}
        >
          <Link
            href="/forgot-password"
            className="text-sm text-[hsl(var(--color-text-secondary))] transition-colors hover:text-[hsl(var(--color-text-primary))]"
          >
            Forgot password?
          </Link>
        </div>

        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "240ms" }}>
          <MagneticButton type="submit" variant="primary" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2 bg-[linear-gradient(90deg,hsl(var(--color-accent-foreground)),hsl(var(--color-accent-soft)),hsl(var(--color-accent-foreground)))] bg-[length:180%_100%] bg-clip-text text-transparent animate-[shimmer_1.8s_linear_infinite]">
                Signing in
                <ArrowRight className="size-4" />
              </span>
            ) : (
              "Sign in"
            )}
          </MagneticButton>
        </div>
      </form>

      <div className="space-y-2 pt-1 text-sm text-[hsl(var(--color-text-secondary))]">
        <p>
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-[hsl(var(--color-accent-soft))] hover:text-[hsl(var(--color-text-primary))]">
            Sign up
          </Link>
        </p>
        <p>
          <Link href="/magic-link" className="hover:text-[hsl(var(--color-text-primary))]">
            Send magic link instead
          </Link>
        </p>
      </div>
    </div>
  )
}
