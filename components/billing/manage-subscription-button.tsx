"use client"

import { useState } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false)

  const handleManageSubscription = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to open customer portal")
      }

      window.location.href = payload.url
    } catch (error) {
      console.error(error)
      setLoading(false)
    }
  }

  return (
    <Button onClick={handleManageSubscription} disabled={loading}>
      {loading ? (
        <>
          <Loader2 className="mr-2 size-4 animate-spin" />
          Opening portal...
        </>
      ) : (
        "Manage Subscription"
      )}
    </Button>
  )
}
