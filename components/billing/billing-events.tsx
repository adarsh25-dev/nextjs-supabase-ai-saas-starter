"use client"

import { useEffect } from "react"
import { useSearchParams } from "next/navigation"

import { trackEvent } from "@/lib/analytics/events"

export function BillingEvents() {
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("success") === "1") {
      trackEvent("plan_subscribed")
    }
  }, [searchParams])

  return null
}
