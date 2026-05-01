"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useMemo, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthHeading } from "@/components/auth/AuthHeading"
import { AuthInput } from "@/components/auth/AuthInput"
import { GoogleButton } from "@/components/auth/google-button"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { signupWithPassword } from "@/app/(auth)/actions"
import { trackEvent } from "@/lib/analytics/events"

const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/\d/, "Password must include at least one number"),
})

type SignupValues = z.infer<typeof signupSchema>

export default function SignupPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  })
  const password = form.watch("password") ?? ""

  const passwordStrength = useMemo(() => {
    let score = 0
    if (password.length >= 8) score += 1
    if (/[a-z]/i.test(password)) score += 1
    if (/\d/.test(password)) score += 1
    if (/[^a-z0-9]/i.test(password)) score += 1
    return score
  }, [password])

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      const result = await signupWithPassword(values)

      if (!result.ok) {
        toast.error(result.message ?? "Unable to create account")
        return
      }

      toast.success(result.message ?? "Account created successfully")
      trackEvent("signup", { method: "password" })
      router.push("/dashboard")
      router.refresh()
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <div className="space-y-6 animate-[hero-fade-up_460ms_cubic-bezier(0.16,1,0.3,1)_both]">
      <AuthHeading title="Create your account" description="Sign up to get started" />

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
            id="fullName"
            label="Full name"
            autoComplete="name"
            placeholder="Adarsh Parmar"
            error={form.formState.errors.fullName?.message}
            {...form.register("fullName")}
          />
        </div>

        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "160ms" }}>
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

        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "200ms" }}>
          <AuthInput
            id="password"
            label="Password"
            type="password"
            autoComplete="new-password"
            placeholder="Create password"
            showTogglePassword
            error={form.formState.errors.password?.message}
            helperText="Use 8+ characters with mix of letters, numbers"
            {...form.register("password")}
          />
          <div className="mt-2 grid grid-cols-4 gap-1.5">
            {["hsl(var(--color-danger))", "hsl(var(--color-warning))", "hsl(46 92% 58%)", "hsl(var(--color-success))"].map(
              (color, index) => (
                <span
                  key={color}
                  className="h-1.5 rounded-full bg-[hsl(var(--color-text-primary)/0.12)]"
                  style={{ backgroundColor: passwordStrength > index ? color : "hsl(var(--color-text-primary)/0.12)" }}
                />
              )
            )}
          </div>
        </div>

        <div className="animate-[hero-fade-up_420ms_cubic-bezier(0.16,1,0.3,1)_both]" style={{ animationDelay: "240ms" }}>
          <MagneticButton type="submit" variant="primary" className="h-11 w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2 bg-[linear-gradient(90deg,hsl(var(--color-accent-foreground)),hsl(var(--color-accent-soft)),hsl(var(--color-accent-foreground)))] bg-[length:180%_100%] bg-clip-text text-transparent animate-[shimmer_1.8s_linear_infinite]">
                Signing up
                <ArrowRight className="size-4" />
              </span>
            ) : (
              "Sign up"
            )}
          </MagneticButton>
        </div>
      </form>

      <p className="text-sm text-[hsl(var(--color-text-secondary))]">
        Already have an account?{" "}
        <Link href="/login" className="text-[hsl(var(--color-accent-soft))] hover:text-[hsl(var(--color-text-primary))]">
          Sign in
        </Link>
      </p>
    </div>
  )
}
