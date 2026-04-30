"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { signOut } from "@/app/(auth)/actions"

export function SignOutButton() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSignOut = async () => {
    try {
      setLoading(true)
      const result = await signOut()
      if (!result.ok) {
        toast.error(result.message ?? "Unable to sign out")
        return
      }

      toast.success("Signed out")
      router.push("/login")
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="ghost" onClick={handleSignOut} disabled={loading}>
      {loading ? "Signing out..." : "Sign out"}
    </Button>
  )
}
