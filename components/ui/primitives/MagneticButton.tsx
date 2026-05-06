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
    "bg-[image:var(--gradient-ember)] text-[hsl(var(--color-accent-foreground))] shadow-[0_0_50px_-16px_hsl(var(--color-accent)/0.45)] hover:shadow-[0_0_60px_-15px_hsl(var(--color-accent)/0.65)]",
  secondary:
    "glass border border-[hsl(var(--color-border))] text-[hsl(var(--color-text-primary))] hover:brightness-110",
  ghost:
    "border border-[hsl(var(--color-border))] bg-transparent text-[hsl(var(--color-text-primary))]",
}

/** Matches pricing / hero buttons: scale must be FM-driven so it composes with magnetic `x`/`y` transforms. */
const hoverTransition = { duration: 0.3, ease: [0.16, 1, 0.3, 1] as const }

export function MagneticButton({
  children,
  className,
  variant = "primary",
  disabled,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement | null>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const springX = useSpring(x, { stiffness: 220, damping: 20 })
  const springY = useSpring(y, { stiffness: 220, damping: 20 })

  const onMouseMove = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || !ref.current) return
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
      disabled={disabled}
      style={{ x: springX, y: springY }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      transition={{ scale: hoverTransition }}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center rounded-xl px-4 py-2.5 text-sm font-medium transition-[box-shadow,filter] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        variantClass[variant],
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}
