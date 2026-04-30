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
import { sendMagicLink } from "@/app/(auth)/actions"

const magicLinkSchema = z.object({
  email: z.string().email("Enter a valid email address"),
})

type MagicLinkValues = z.infer<typeof magicLinkSchema>

export default function MagicLinkPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const form = useForm<MagicLinkValues>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      setIsSubmitting(true)
      const result = await sendMagicLink(values)
      if (!result.ok) {
        toast.error(result.message ?? "Unable to send magic link")
        return
      }
      toast.success(result.message ?? "Magic link sent")
    } finally {
      setIsSubmitting(false)
    }
  })

  return (
    <AuthForm
      title="Email login link"
      description="We will send a one-click sign-in link to your email."
      submitLabel="Send magic link"
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      footer={
        <p className="text-sm text-muted-foreground">
          Prefer password login?{" "}
          <Link href="/login" className="font-medium text-foreground underline underline-offset-4">
            Back to login
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
