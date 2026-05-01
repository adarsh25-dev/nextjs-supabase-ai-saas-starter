"use client"

import { motion } from "framer-motion"

import { GlowCard } from "@/components/ui/primitives/GlowCard"
import { Logo } from "@/components/ui/primitives/Logo"
import { Spotlight } from "@/components/ui/primitives/Spotlight"

export function AuthDecorPanel() {
  return (
    <aside className="relative hidden overflow-hidden bg-black lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-10 lg:py-10">
      <Spotlight />
      <motion.div
        className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 rounded-full blur-[110px]"
        style={{ background: "hsl(16 60% 60% / 0.18)" }}
        animate={{ x: [0, 18, -10, 0], y: [0, -14, 8, 0] }}
        transition={{ duration: 22, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="pointer-events-none absolute -bottom-24 right-[-4rem] h-96 w-96 rounded-full blur-[120px]"
        style={{ background: "hsl(32 47% 61% / 0.12)" }}
        animate={{ x: [0, -16, 8, 0], y: [0, 12, -8, 0] }}
        transition={{ duration: 24, repeat: Infinity, ease: "easeInOut", delay: 0.9 }}
      />

      <div className="relative z-10 space-y-3">
        <Logo size="lg" />
        <p className="max-w-xs text-sm text-[hsl(var(--color-text-secondary))]">
          Build premium AI products with battle-tested auth, billing, and chat foundations.
        </p>
      </div>

      <motion.div
        className="relative z-10 mx-auto w-full max-w-sm will-change-transform"
        animate={{ y: [0, -10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <GlowCard glow className="space-y-3 p-5 [backdrop-filter:none]">
          <p className="text-xs uppercase tracking-[0.12em] text-[hsl(var(--color-text-secondary))]">Live preview</p>
          <div className="space-y-2 font-mono text-xs">
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.7)] p-2 text-[hsl(var(--color-text-secondary))]">
              User: launch copy for a new AI feature
            </div>
            <div className="rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg)/0.7)] p-2 text-[hsl(var(--color-text-primary))]">
              Assistant: Drafting polished announcement...
            </div>
          </div>
        </GlowCard>
      </motion.div>

      <div className="relative z-10">
        <GlowCard className="max-w-sm p-4">
          <p className="text-sm italic text-[hsl(var(--color-text-primary))]">
            “Built our entire MVP in 2 weeks.”
          </p>
          <div className="mt-3 flex items-center gap-3">
            <span className="inline-block size-8 rounded-full border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg))]" />
            <p className="text-xs text-[hsl(var(--color-text-secondary))]">Founder, Acme AI</p>
          </div>
        </GlowCard>
      </div>
    </aside>
  )
}
