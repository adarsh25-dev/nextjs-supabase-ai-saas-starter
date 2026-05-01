"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
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

const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/\d/, "Password must include at least one number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        password: values.password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success("Password updated successfully")
      setIsSuccess(true)
    } finally {
      setIsSubmitting(false)
    }
  })

  useEffect(() => {
    if (!isSuccess) return
    const timer = window.setTimeout(() => {
      router.push("/login")
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [isSuccess, router])

  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="space-y-6 text-center"
          >
            <CheckmarkSuccess />
            <AuthHeading title="Password updated" description="Your password was updated. Redirecting to login..." className="text-center" />
            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              Return now to{" "}
              <Link href="/login" className="text-[hsl(var(--color-accent-soft))] hover:text-[hsl(var(--color-text-primary))]">
                login
              </Link>
            </p>
          </motion.div>
        ) : (
          <motion.form key="form" onSubmit={onSubmit} className="space-y-5" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <AuthHeading title="Reset password" description="Create a new password for your account." />

            <AuthInput
              id="password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="Create password"
              showTogglePassword
              error={form.formState.errors.password?.message}
              {...form.register("password")}
            />

            <AuthInput
              id="confirmPassword"
              label="Confirm password"
              type="password"
              autoComplete="new-password"
              placeholder="Re-enter password"
              showTogglePassword
              error={form.formState.errors.confirmPassword?.message}
              {...form.register("confirmPassword")}
            />

            <MagneticButton type="submit" variant="primary" className="h-11 w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <span className="inline-flex items-center gap-2 bg-[linear-gradient(90deg,hsl(var(--color-accent-foreground)),hsl(var(--color-accent-soft)),hsl(var(--color-accent-foreground)))] bg-[length:180%_100%] bg-clip-text text-transparent animate-[shimmer_1.8s_linear_infinite]">
                  Updating
                  <ArrowRight className="size-4" />
                </span>
              ) : (
                "Update password"
              )}
            </MagneticButton>

            <p className="text-sm text-[hsl(var(--color-text-secondary))]">
              Return to{" "}
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
