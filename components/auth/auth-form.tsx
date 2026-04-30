"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

type AuthFormProps = {
  title: string
  description?: string
  submitLabel: string
  isSubmitting?: boolean
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
  children: ReactNode
  footer?: ReactNode
}

export function AuthForm({
  title,
  description,
  submitLabel,
  isSubmitting = false,
  onSubmit,
  children,
  footer,
}: AuthFormProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : submitLabel}
          </Button>
        </form>
      </CardContent>
      {footer ? <CardFooter className="flex-col items-start gap-3">{footer}</CardFooter> : null}
    </Card>
  )
}
