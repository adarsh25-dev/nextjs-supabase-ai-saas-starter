"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"
import { AlertTriangle, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/primitives/EmptyState"

export default function MarketingGroupError({
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
    <div className="mx-auto flex min-h-[64vh] w-full max-w-3xl items-center justify-center px-4 py-8">
      <EmptyState
        icon={<AlertTriangle className="size-5" />}
        title="Unable to load this page"
        description="Something interrupted rendering. Retry to continue browsing."
        action={
          <Button onClick={reset}>
            <RefreshCw className="mr-1.5 size-4" />
            Try again
          </Button>
        }
      />
    </div>
  )
}
