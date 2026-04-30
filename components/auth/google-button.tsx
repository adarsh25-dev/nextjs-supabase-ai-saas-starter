"use client"

import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function GoogleButton() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const supabase = createClient()
      const searchParams = new URLSearchParams(window.location.search)
      const next = searchParams.get("next") ?? "/dashboard"
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      })

      if (error) throw error
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Google sign-in failed")
      setLoading(false)
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      className="w-full"
      onClick={handleGoogleLogin}
      disabled={loading}
    >
      <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4" aria-hidden="true">
        <path
          d="M21.35 11.1H12v2.98h5.38c-.23 1.43-1.61 4.2-5.38 4.2-3.24 0-5.88-2.68-5.88-5.98s2.64-5.98 5.88-5.98c1.84 0 3.07.78 3.77 1.46l2.58-2.49C16.68 3.7 14.55 2.8 12 2.8 6.92 2.8 2.8 6.92 2.8 12s4.12 9.2 9.2 9.2c5.3 0 8.82-3.72 8.82-8.96 0-.6-.06-1.03-.14-1.14Z"
          fill="currentColor"
        />
      </svg>
      {loading ? "Redirecting..." : "Continue with Google"}
    </Button>
  )
}
