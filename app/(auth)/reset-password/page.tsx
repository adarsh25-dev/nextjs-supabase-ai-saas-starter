"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthForm } from "@/components/auth/auth-form"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
      router.push("/login")
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthForm
      title="Reset password"
      description="Create a new password for your account."
      submitLabel="Update password"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      footer={
        <p className="text-sm text-muted-foreground">
          Return to{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            login
          </Link>
        </p>
      }
    >
      <div className="space-y-2">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" {...form.register("password")} />
        {form.formState.errors.password ? (
          <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirm password</Label>
        <Input id="confirmPassword" type="password" {...form.register("confirmPassword")} />
        {form.formState.errors.confirmPassword ? (
          <p className="text-sm text-destructive">
            {form.formState.errors.confirmPassword.message}
          </p>
        ) : null}
      </div>
    </AuthForm>
  )
}
