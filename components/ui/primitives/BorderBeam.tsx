"use client"

import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

export function BorderBeam({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 rounded-2xl overflow-hidden", className)}>
      <motion.div
        className="absolute -inset-[120%] rounded-[999px] bg-[conic-gradient(from_0deg,transparent_0deg,hsl(var(--color-accent)/0.85)_80deg,transparent_160deg)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 5.5, ease: "linear", repeat: Infinity }}
      />
    </div>
  )
}
