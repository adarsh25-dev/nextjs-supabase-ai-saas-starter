"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { ArrowRight } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthHeading } from "@/components/auth/AuthHeading"
import { AuthInput } from "@/components/auth/AuthInput"
import { MagneticButton } from "@/components/ui/primitives/MagneticButton"
import { createClient } from "@/lib/supabase/client"

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null)
  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Password reset email sent. Check your inbox.")
      setSubmittedEmail(values.email)
    } finally {
      setIsSubmitting(false)
    }
  })

  const resendEmail = async () => {
    if (!submittedEmail) return
    try {
      setIsSubmitting(true)
      const supabase = createClient()
      const redirectTo = `${window.location.origin}/reset-password`
      const { error } = await supabase.auth.resetPasswordForEmail(submittedEmail, { redirectTo })
      if (error) {
        toast.error(error.message)
        return
      }
      toast.success("Reset email sent again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AnimatePresence mode="wait">
        {submittedEmail ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6 text-center"
          >
            <CheckmarkSuccess />
            <AuthHeading
              title="Check your email"
              description={`We sent a password reset link to ${submittedEmail}.`}
              className="text-center"
            />
            <button
              type="button"
              onClick={resendEmail}
              disabled={isSubmitting}
              className="text-sm text-[hsl(var(--color-accent-soft))] transition-colors hover:text-[hsl(var(--color-text-primary))]"
            >
              Resend email
            </button>
            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              Back to{" "}
              <Link href="/login" className="text-[hsl(var(--color-accent-soft))] hover:text-[hsl(var(--color-text-primary))]">
                login
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AuthHeading title="Forgot password" description="Enter your email to receive a reset link." />
            <AuthInput
              id="email"
              label="Email"
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              error={form.formState.errors.email?.message}
              {...form.register("email")}
            />
            <MagneticButton type="submit" variant="primary" className="h-11 w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2 bg-[linear-gradient(90deg,hsl(var(--color-accent-foreground)),hsl(var(--color-accent-soft)),hsl(var(--color-accent-foreground)))] bg-[length:180%_100%] bg-clip-text text-transparent animate-[shimmer_1.8s_linear_infinite]">
                  Sending
                  <ArrowRight className="size-4" />
                </span>
              ) : (
                "Send reset link"
              )}
            </MagneticButton>
            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              Back to{" "}
              <Link href="/login" className="text-[hsl(var(--color-accent-soft))] hover:text-[hsl(var(--color-text-primary))]">
                login
              </Link>
            </p>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function CheckmarkSuccess() {
  return (
    <div className="mx-auto inline-flex size-16 items-center justify-center rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated)/0.7)]">
      <motion.svg viewBox="0 0 52 52" className="size-8">
        <motion.path
          d="M14 27l8 8 16-16"
          fill="none"
          stroke="hsl(var(--color-success))"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
        />
      </motion.svg>
    </div>
  )
}
