"use client"

import * as Sentry from "@sentry/nextjs"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useEffect } from "react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/primitives/EmptyState"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
  }, [error])

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-[hsl(var(--color-bg))] p-6 text-[hsl(var(--color-text-primary))]">
        <div className="w-full max-w-3xl">
          <EmptyState
            icon={<AlertTriangle className="size-5" />}
            title="Unexpected error"
            description="We logged this issue and are already investigating. You can retry now."
            action={
              <Button onClick={reset}>
                <RefreshCw className="mr-1.5 size-4" />
                Try again
              </Button>
            }
          />
        </div>
      </body>
    </html>
  )
}
