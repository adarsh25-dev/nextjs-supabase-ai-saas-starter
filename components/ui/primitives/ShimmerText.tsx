"use client"

import { cn } from "@/lib/utils"

export function ShimmerText({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <span
      className={cn(
        "inline-block bg-[linear-gradient(120deg,hsl(var(--color-text-primary)/0.45),hsl(var(--color-accent-soft)),hsl(var(--color-text-primary)/0.45))] bg-[length:220%_100%] bg-clip-text text-transparent animate-[shimmer_2.4s_linear_infinite]",
        className
      )}
    >
      {children}
    </span>
  )
}
