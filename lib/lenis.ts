"use client"

import Lenis from "lenis"
import { useEffect, useState } from "react"

let sharedLenis: Lenis | null = null
let rafId: number | null = null

function startRafLoop() {
  if (rafId !== null || !sharedLenis) return

  const loop = (time: number) => {
    sharedLenis?.raf(time)
    rafId = window.requestAnimationFrame(loop)
  }

  rafId = window.requestAnimationFrame(loop)
}

function stopRafLoop() {
  if (rafId === null) return
  window.cancelAnimationFrame(rafId)
  rafId = null
}

export function initLenis() {
  if (typeof window === "undefined") return null
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
  const isDesktop = window.matchMedia("(min-width: 1024px)").matches
  if (prefersReducedMotion || !isDesktop) return null
  if (sharedLenis) return sharedLenis

  sharedLenis = new Lenis({
    duration: 1.1,
    smoothWheel: true,
    gestureOrientation: "vertical",
  })
  startRafLoop()
  return sharedLenis
}

export function destroyLenis() {
  sharedLenis?.destroy()
  sharedLenis = null
  stopRafLoop()
}

export function getLenisInstance() {
  return sharedLenis
}

export function useLenis() {
  const [instance, setInstance] = useState<Lenis | null>(null)

  useEffect(() => {
    setInstance(getLenisInstance())
  }, [])

  return instance
}
