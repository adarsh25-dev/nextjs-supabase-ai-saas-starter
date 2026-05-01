"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type LogoProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeStyles: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-sm",
  md: "text-lg",
  lg: "text-2xl",
}

export function Logo({ size = "md", className }: LogoProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={cn("inline-flex items-center gap-2 font-medium tracking-[-0.04em]", sizeStyles[size], className)}
    >
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true" className="shrink-0">
        <rect x="2" y="2" width="20" height="20" rx="6" fill="hsl(var(--color-bg-elevated))" />
        <path d="M7 16V8h2.2l4.8 5.8V8H17v8h-2.2L10 10.2V16z" fill="hsl(var(--color-text-primary))" />
      </svg>
      <span className="text-[hsl(var(--color-text-primary))]">SaaS Starter</span>
      <span className="size-1.5 rounded-full bg-[hsl(var(--color-accent))]" />
    </motion.div>
  )
}
