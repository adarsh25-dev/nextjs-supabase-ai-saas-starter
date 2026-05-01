"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useEffect, useRef } from "react"

type SpotlightProps = {
  trackPointer?: boolean
}

export function Spotlight({ trackPointer = false }: SpotlightProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const pointerX = useMotionValue(20)
  const pointerY = useMotionValue(12)
  const x = useSpring(pointerX, { damping: 30, stiffness: 120 })
  const y = useSpring(pointerY, { damping: 30, stiffness: 120 })

  useEffect(() => {
    if (!trackPointer) return

    const onMove = (event: MouseEvent) => {
      if (!wrapperRef.current) return
      const rect = wrapperRef.current.getBoundingClientRect()
      pointerX.set(((event.clientX - rect.left) / rect.width) * 100)
      pointerY.set(((event.clientY - rect.top) / rect.height) * 100)
    }

    window.addEventListener("mousemove", onMove)
    return () => window.removeEventListener("mousemove", onMove)
  }, [pointerX, pointerY, trackPointer])

  return (
    <div ref={wrapperRef} className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <motion.ellipse
          cx={x}
          cy={y}
          rx="26"
          ry="18"
          fill="hsl(16 60% 60% / 0.16)"
          filter="blur(38px)"
        />
      </motion.svg>
    </div>
  )
}
