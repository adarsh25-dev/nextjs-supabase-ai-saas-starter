"use client"

import { motion } from "framer-motion"

type RevealOnScrollProps = {
  children: React.ReactNode
  delay?: number
  offset?: number
  className?: string
}

export function RevealOnScroll({
  children,
  delay = 0,
  offset = 18,
  className,
}: RevealOnScrollProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: offset }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  )
}
