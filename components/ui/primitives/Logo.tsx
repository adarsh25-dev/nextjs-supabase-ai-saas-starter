"use client"

import { motion } from "framer-motion"

import { BRAND_NAME } from "@/lib/brand"
import { cn } from "@/lib/utils"

type LogoProps = {
  size?: "sm" | "md" | "lg"
  className?: string
}

const sizeStyles: Record<NonNullable<LogoProps["size"]>, string> = {
  sm: "text-base",
  md: "text-xl",
  lg: "text-3xl",
}

const svgSizes: Record<NonNullable<LogoProps["size"]>, number> = {
  sm: 22,
  md: 30,
  lg: 38,
}

export function Logo({ size = "md", className }: LogoProps) {
  const svgSize = svgSizes[size]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
      className={cn("inline-flex items-center gap-2.5 font-medium tracking-[-0.04em]", sizeStyles[size], className)}
    >
      <img
        src="/LaunchForge.png"
        alt="LaunchForge Logo"
        width={svgSize}
        height={svgSize}
        className="shrink-0 rounded-full"
      />
      <span className="text-[hsl(var(--color-text-primary))]">{BRAND_NAME}</span>
      <span className={cn(
        "rounded-full bg-[hsl(var(--color-accent))]",
        size === "sm" ? "size-1.5" : size === "md" ? "size-2" : "size-2.5"
      )} />
    </motion.div>
  )
}
