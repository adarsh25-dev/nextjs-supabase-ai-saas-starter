"use client"

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion"
import { useEffect, useRef } from "react"

type AnimatedNumberProps = {
  value: number
  format?: "number" | "currency" | "percentage"
  className?: string
}

function formatValue(value: number, format: AnimatedNumberProps["format"]) {
  if (format === "currency") return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value)
  if (format === "percentage") return `${value.toFixed(0)}%`
  return new Intl.NumberFormat("en-US").format(Math.round(value))
}

export function AnimatedNumber({ value, format = "number", className }: AnimatedNumberProps) {
  const ref = useRef<HTMLSpanElement | null>(null)
  const inView = useInView(ref, { once: true, margin: "-20% 0px" })
  const motionValue = useMotionValue(0)
  const display = useTransform(motionValue, (latest) => formatValue(latest, format))

  useEffect(() => {
    if (!inView) return
    const controls = animate(motionValue, value, {
      duration: 1.4,
      ease: [0.16, 1, 0.3, 1],
    })
    return () => controls.stop()
  }, [inView, motionValue, value])

  return (
    <motion.span ref={ref} className={className}>
      {display}
    </motion.span>
  )
}
