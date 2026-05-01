"use client"

import { motion } from "framer-motion"

export function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute -top-40 -left-40 h-[36rem] w-[36rem] rounded-full blur-[130px] md:opacity-100 opacity-60"
        style={{ background: "hsl(16 60% 60% / 0.18)" }}
        animate={{ x: [0, 20, -12, 0], y: [0, -18, 14, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -top-24 right-[-8rem] h-[34rem] w-[34rem] rounded-full blur-[130px] md:opacity-100 opacity-60"
        style={{ background: "hsl(32 47% 61% / 0.1)" }}
        animate={{ x: [0, -24, 10, 0], y: [0, 16, -12, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
      />
    </div>
  )
}
