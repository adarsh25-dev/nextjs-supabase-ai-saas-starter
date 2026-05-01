"use client"

import { usePathname } from "next/navigation"

import { CommandPalette } from "@/components/ui/primitives/CommandPalette"

export function GlobalCommandPalette() {
  const pathname = usePathname()

  if (pathname.startsWith("/dashboard")) {
    return null
  }

  return <CommandPalette />
}
