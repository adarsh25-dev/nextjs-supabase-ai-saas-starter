"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

import { Button } from "@/components/ui/button"

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
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h2 className="text-xl font-semibold">Unable to load page</h2>
      <p className="text-sm text-muted-foreground">
        We hit an issue loading this page. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  )
}
