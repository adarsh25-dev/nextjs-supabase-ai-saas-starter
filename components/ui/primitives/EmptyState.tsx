import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

type EmptyStateProps = {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "glass gradient-border relative flex min-h-44 flex-col items-center justify-center rounded-2xl border border-[hsl(var(--color-border))] px-6 py-10 text-center",
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,hsl(var(--color-accent)/0.14),transparent_60%)]" />
      {icon ? (
        <div className="relative mb-3 inline-flex size-11 items-center justify-center rounded-xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-primary))]">
          {icon}
        </div>
      ) : null}
      <h3 className="relative text-base font-semibold text-[hsl(var(--color-text-primary))]">{title}</h3>
      {description ? (
        <p className="relative mt-1 max-w-md text-sm text-[hsl(var(--color-text-secondary))]">{description}</p>
      ) : null}
      {action ? <div className="relative mt-4">{action}</div> : null}
    </div>
  )
}
