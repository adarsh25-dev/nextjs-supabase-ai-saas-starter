"use client"

import { useEffect } from "react"

import { destroyLenis, initLenis } from "@/lib/lenis"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initLenis()
    return () => {
      destroyLenis()
    }
  }, [])

  return <>{children}</>
}
