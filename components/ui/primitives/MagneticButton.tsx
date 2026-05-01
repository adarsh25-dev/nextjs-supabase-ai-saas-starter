"use client"

import { motion, useMotionValue, useSpring } from "framer-motion"
import { useRef } from "react"

import { cn } from "@/lib/utils"

type MagneticButtonProps = {
  children: React.ReactNode
  className?: string
  variant?: "primary" | "secondary" | "ghost"
} & Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
>

const variantClass: Record<NonNullable<MagneticButtonProps["variant"]>, string> = {
  primary:
    "bg-[image:var(--gradient-ember)] text-[hsl(var(--color-accent-foreground))] shadow-[0_0_50px_-16px_hsl(var(--color-accent)/0.45)]",
  secondary: "glass text-[hsl(var(--color-text-primary))]",
  ghost: "bg-transparent text-[hsl(var(--color-text-primary))] border border-[hsl(var(--color-border))]",
}

export function MagneticButton({
  children,
  className,
  variant = "primary",
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 20 })
  const springY = useSpring(y, { stiffness: 220, damping: 20 })

  const onMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const px = event.clientX - rect.left - rect.width / 2
    const py = event.clientY - rect.top - rect.height / 2
    x.set(Math.max(-8, Math.min(8, px * 0.18)))
    y.set(Math.max(-8, Math.min(8, py * 0.18)))
  }

  const onMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.button
      ref={ref}
      type="button"
      style={{ x: springX, y: springY }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02]",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
