"use client"

import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from "recharts"
import type { LucideIcon } from "lucide-react"

import { AnimatedNumber } from "@/components/ui/primitives/AnimatedNumber"
import { cn } from "@/lib/utils"

type Trend = {
  value: number
  direction: "up" | "down"
}

type StatCardProps = {
  icon: LucideIcon
  label: string
  value?: number
  valueText?: string
  trend?: Trend
  sparkline: Array<{ x: string; y: number }>
  className?: string
}

export function StatCard({
  icon: Icon,
  label,
  value,
  valueText,
  trend,
  sparkline,
  className,
}: StatCardProps) {
  const gradientId = `spark-${label.toLowerCase().replace(/\s+/g, "-")}`
  const trendColor =
    trend?.direction === "up"
      ? "text-emerald-300"
      : trend?.direction === "down"
        ? "text-rose-300"
        : "text-[hsl(var(--color-text-secondary))]"
  const trendArrow = trend?.direction === "up" ? "▲" : "▼"

  return (
    <motion.div
      whileHover={{ y: -2, scale: 1.01 }}
      transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-6",
        "gradient-border transition-all duration-200",
        "after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-[hsl(var(--color-accent)/0.65)] after:opacity-0 after:transition-opacity after:duration-300 group-hover:after:opacity-100",
        "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent",
        className
      )}
    >
      <div className="mb-5 flex items-center gap-2">
        <Icon className="size-4 text-[hsl(var(--color-accent-soft))]" />
        <p className="text-xs uppercase tracking-[0.14em] text-[hsl(var(--color-text-secondary))]">{label}</p>
      </div>

      <div className="mb-2 min-h-12">
        {typeof value === "number" ? (
          <AnimatedNumber
            value={value}
            className="font-display text-4xl font-medium tracking-tight text-[hsl(var(--color-text-primary))]"
          />
        ) : (
          <span className="font-display text-4xl font-medium tracking-tight text-[hsl(var(--color-text-primary))]">
            {valueText}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <p className="text-xs text-[hsl(var(--color-text-secondary))]">
          {trend ? (
            <>
              <span className={cn("mr-1 font-medium", trendColor)}>
                {trendArrow} {Math.abs(trend.value)}%
              </span>
              <span>vs last month</span>
            </>
          ) : (
            "Current subscription tier"
          )}
        </p>
        <div className="h-10 w-24 min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
            <AreaChart data={sparkline}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--color-accent))" stopOpacity={0.42} />
                  <stop offset="95%" stopColor="hsl(var(--color-accent))" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis dataKey="x" hide />
              <Tooltip
                cursor={false}
                contentStyle={{
                  borderRadius: "0.75rem",
                  border: "1px solid hsl(var(--color-border))",
                  background: "hsl(var(--color-bg-elevated) / 0.9)",
                  color: "hsl(var(--color-text-primary))",
                }}
                labelStyle={{ color: "hsl(var(--color-text-secondary))" }}
              />
              <Area
                type="monotone"
                dataKey="y"
                stroke="hsl(var(--color-accent-soft))"
                strokeWidth={2}
                fill={`url(#${gradientId})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </motion.div>
  )
}
