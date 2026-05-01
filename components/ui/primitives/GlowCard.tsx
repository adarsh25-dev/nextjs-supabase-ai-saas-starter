"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type GlowCardProps = {
  children: React.ReactNode
  className?: string
  glow?: boolean
}

export function GlowCard({ children, className, glow = false }: GlowCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
      className={cn("relative rounded-2xl", glow && "isolate")}
    >
      {glow ? (
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-2xl bg-[hsl(var(--color-accent)/0.26)] blur-2xl"
        />
      ) : null}
      <div
        className={cn(
          "gradient-border glass relative z-[1] rounded-2xl p-6 transition-[filter,transform] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
          className
        )}
      >
        {children}
      </div>
    </motion.div>
  )
}
