"use client"

import Link from "next/link"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthForm } from "@/components/auth/auth-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"

const forgotPasswordSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthForm
      title="Forgot password"
      description="Enter your email to receive a reset link."
      submitLabel="Send reset link"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      footer={
        <p className="text-sm text-muted-foreground">
          Back to{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            login
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" {...form.register("email")} />
        {form.formState.errors.email ? (
          <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
        ) : null}
      </div>
    </AuthForm>
  )
}
