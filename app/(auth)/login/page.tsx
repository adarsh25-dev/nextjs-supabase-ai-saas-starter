"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { z } from "zod"

import { AuthForm } from "@/components/auth/auth-form"
import { GoogleButton } from "@/components/auth/google-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
    <div className="space-y-4">
      <AuthForm
        title="Welcome back"
        description="Sign in with your email and password."
        submitLabel="Log in"
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        footer={
          <>
            <p className="text-sm text-muted-foreground">
              <Link href="/magic-link" className="underline underline-offset-4">
                Send magic link instead
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              No account?{" "}
              <Link href="/signup" className="font-medium text-foreground underline underline-offset-4">
                Create one
              </Link>
            </p>
            <p className="text-sm text-muted-foreground">
              <Link href="/forgot-password" className="underline underline-offset-4">
                Forgot password?
              </Link>
            </p>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...form.register("email")} />
          {form.formState.errors.email ? (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" {...form.register("password")} />
          {form.formState.errors.password ? (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          ) : null}
        </div>
      </AuthForm>

      <GoogleButton />
    </div>
  )
}
