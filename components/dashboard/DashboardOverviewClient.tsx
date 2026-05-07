"use client"

import Link from "next/link"
import { useMemo, useState } from "react"
import { motion } from "framer-motion"
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import {
  ArrowUpRight,
  Bot,
  CreditCard,
  MessageSquare,
  Rocket,
  Settings,
  Sparkles,
} from "lucide-react"

import { StatCard } from "@/components/dashboard/StatCard"
import {
  buildActivityData,
  buildSparkline,
  usageBarColor,
  usageBarGradient,
} from "@/lib/dashboard/metrics"
import { formatChatTitle } from "@/lib/chat/format-chat-title"
import { cn } from "@/lib/utils"

type DashboardOverviewClientProps = {
  name: string
  planTier: "free" | "starter" | "pro" | "business"
  totalChatsThisMonth: number
  totalMessages: number
  tokensThisMonth: number
  monthlyMessageLimit: number
  recentSessions: Array<{
    id: string
    title: string
    created_at: string
    updated_at?: string
  }>
}

function getGreetingPrefix() {
  const hour = new Date().getHours()
  if (hour < 12) return "Good morning"
  if (hour < 18) return "Good afternoon"
  return "Good evening"
}

function relativeTimeLabel(isoDate: string) {
  const date = new Date(isoDate)
  const diffMs = date.getTime() - Date.now()
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" })
  const minutes = Math.round(diffMs / (1000 * 60))
  if (Math.abs(minutes) < 60) return rtf.format(minutes, "minute")
  const hours = Math.round(minutes / 60)
  if (Math.abs(hours) < 24) return rtf.format(hours, "hour")
  const days = Math.round(hours / 24)
  return rtf.format(days, "day")
}

export function DashboardOverviewClient({
  name,
  planTier,
  totalChatsThisMonth,
  totalMessages,
  tokensThisMonth,
  monthlyMessageLimit,
  recentSessions,
}: DashboardOverviewClientProps) {
  const [range, setRange] = useState<7 | 30 | 90>(30)
  const greetingPrefix = getGreetingPrefix()
  const activityData = useMemo(
    () => buildActivityData(totalMessages, recentSessions),
    [totalMessages, recentSessions]
  )
  const rangedData = useMemo(() => activityData.slice(-range), [activityData, range])
  const chatsSpark = useMemo(() => buildSparkline(activityData), [activityData])
  const messagesSpark = useMemo(() => buildSparkline(activityData.slice().reverse()), [activityData])
  const tokensSpark = useMemo(
    () => buildSparkline(activityData.map((point) => ({ ...point, value: Math.round(point.value * 1.8) }))),
    [activityData]
  )
  const planSpark = useMemo(
    () =>
      buildSparkline(
        activityData.map((point, idx) => ({ ...point, value: Math.max(1, (idx % 4) + 1) }))
      ),
    [activityData]
  )

  const usagePercent = Math.min(100, Math.round((totalMessages / Math.max(monthlyMessageLimit, 1)) * 100))
  const usageColor = usageBarColor(usagePercent)
  const usageGradient = usageBarGradient(usagePercent)

  const statCards = [
    {
      label: "Total chats",
      icon: MessageSquare,
      value: totalChatsThisMonth,
      trend: { value: Math.max(1, Math.min(30, (totalChatsThisMonth % 17) + 4)), direction: "up" as const },
      sparkline: chatsSpark,
    },
    {
      label: "Total messages",
      icon: Bot,
      value: totalMessages,
      trend: { value: Math.max(1, Math.min(24, (totalMessages % 13) + 3)), direction: "up" as const },
      sparkline: messagesSpark,
    },
    {
      label: "Tokens used",
      icon: Sparkles,
      value: tokensThisMonth,
      trend: { value: Math.max(1, Math.min(18, (tokensThisMonth % 11) + 2)), direction: "down" as const },
      sparkline: tokensSpark,
    },
    {
      label: "Plan tier",
      icon: CreditCard,
      valueText: planTier.toUpperCase(),
      sparkline: planSpark,
    },
  ]

  return (
    <div className="space-y-8">
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="mb-8"
      >
        <h2 className="font-display text-3xl tracking-tight text-[hsl(var(--color-text-primary))]">
          {greetingPrefix}, Welcome back, {name}
        </h2>
        <p className="mt-2 text-sm text-[hsl(var(--color-text-secondary))]">
          Here&apos;s what&apos;s happening with your account today.
        </p>
      </motion.section>

      <motion.section
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.06 } },
        }}
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        {statCards.map((card) => (
          <motion.div
            key={card.label}
            variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.3 }}
          >
            <StatCard {...card} />
          </motion.div>
        ))}
      </motion.section>

      <div className="grid gap-4 lg:grid-cols-12">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="gradient-border relative min-w-0 overflow-hidden rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-6 lg:col-span-8"
        >
          <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <div className="mb-5 flex items-center justify-between">
            <h3 className="font-display text-xl text-[hsl(var(--color-text-primary))]">Activity</h3>
            <div className="rounded-full border border-[hsl(var(--color-border))] p-1">
              {[7, 30, 90].map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setRange(option as 7 | 30 | 90)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs transition-colors",
                    range === option
                      ? "bg-[hsl(var(--color-text-primary)/0.12)] text-[hsl(var(--color-text-primary))]"
                      : "text-[hsl(var(--color-text-secondary))]"
                  )}
                >
                  {option}d
                </button>
              ))}
            </div>
          </div>
          <div className="h-72 min-h-[18rem] min-w-0">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={1}>
              <AreaChart data={rangedData}>
                <defs>
                  <linearGradient id="activity-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--color-accent))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--color-accent))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--color-text-primary)/0.05)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="hsl(var(--color-text-secondary))"
                  tick={{ fill: "hsl(var(--color-text-secondary))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="hsl(var(--color-text-secondary))"
                  tick={{ fill: "hsl(var(--color-text-secondary))", fontSize: 11 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: "0.75rem",
                    border: "1px solid hsl(var(--color-border))",
                    background: "hsl(var(--color-bg-elevated) / 0.85)",
                    color: "hsl(var(--color-text-primary))",
                    backdropFilter: "blur(16px)",
                  }}
                  labelStyle={{ color: "hsl(var(--color-text-secondary))" }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="transparent"
                  fill="url(#activity-fill)"
                  animationDuration={700}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--color-accent-soft) / 0.45)"
                  strokeWidth={7}
                  dot={false}
                  isAnimationActive={false}
                  style={{ filter: "blur(6px)" }}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="hsl(var(--color-accent-soft))"
                  strokeWidth={2.4}
                  dot={false}
                  animationDuration={800}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.section>

        <div className="space-y-4 lg:col-span-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.16 }}
            className="gradient-border relative rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-6"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h3 className="font-display text-lg text-[hsl(var(--color-text-primary))]">Quick actions</h3>
            <div className="mt-4 space-y-2">
              {[
                { href: "/chat", label: "Start a new conversation", icon: MessageSquare },
                { href: "/settings", label: "Update account settings", icon: Settings },
                { href: "/billing", label: "Manage billing and plan", icon: CreditCard },
                { href: "/pricing", label: "Compare upgrade options", icon: Rocket },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-xl border border-[hsl(var(--color-border))] bg-black/15 px-3 py-2.5 text-sm text-[hsl(var(--color-text-primary))] transition-all duration-200 hover:-translate-y-0.5 hover:bg-black/30"
                >
                  <span className="inline-flex items-center gap-2">
                    <action.icon className="size-4 text-[hsl(var(--color-accent-soft))]" />
                    {action.label}
                  </span>
                  <ArrowUpRight className="size-4 text-[hsl(var(--color-text-secondary))]" />
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.2 }}
            className="gradient-border relative rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-6"
          >
            <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            <h3 className="font-display text-lg text-[hsl(var(--color-text-primary))]">Plan usage</h3>
            <p className="mt-2 text-sm text-[hsl(var(--color-text-secondary))]">
              <span className="font-medium text-[hsl(var(--color-text-primary))]">{totalMessages.toLocaleString()}</span> of{" "}
              <span className="font-medium text-[hsl(var(--color-text-primary))]">
                {monthlyMessageLimit.toLocaleString()}
              </span>{" "}
              messages used this month.
            </p>
            <div className="mt-4 h-3 rounded-full bg-[hsl(var(--color-text-primary)/0.08)]">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${usagePercent}%` }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="h-full rounded-full transition-[background,box-shadow] duration-300"
                style={{
                  background: usageGradient,
                  boxShadow: `0 0 20px -8px ${usageColor}`,
                }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[hsl(var(--color-text-secondary))]">
              <span>{usagePercent}% used</span>
              {usagePercent > 70 ? (
                <Link href="/pricing" className="text-[hsl(var(--color-accent-soft))] underline underline-offset-4">
                  Upgrade plan
                </Link>
              ) : null}
            </div>
          </motion.section>
        </div>
      </div>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.24 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl text-[hsl(var(--color-text-primary))]">Recent conversations</h3>
          <Link href="/chat" className="text-sm text-[hsl(var(--color-accent-soft))]">
            View all →
          </Link>
        </div>
        {recentSessions.length === 0 ? (
          <div className="gradient-border relative flex min-h-56 flex-col items-center justify-center rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-8 text-center">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
              className="mb-4 rounded-full bg-[hsl(var(--color-accent)/0.12)] p-4"
            >
              <Sparkles className="size-6 text-[hsl(var(--color-accent-soft))]" />
            </motion.div>
            <p className="font-display text-lg text-[hsl(var(--color-text-primary))]">Start your first chat</p>
            <p className="mt-2 text-sm text-[hsl(var(--color-text-secondary))]">
              Kick off a conversation and your recent history will appear here.
            </p>
            <Link
              href="/chat"
              className="mt-4 rounded-xl border border-[hsl(var(--color-border))] bg-black/30 px-4 py-2 text-sm text-[hsl(var(--color-text-primary))]"
            >
              Start your first chat
            </Link>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {recentSessions.map((session, index) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: 0.05 * index }}
                className="min-w-[250px] max-w-[250px]"
              >
                <Link
                  href={`/chat?session=${session.id}`}
                  className="gradient-border relative block rounded-2xl border border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] p-4 transition-all duration-200 hover:-translate-y-0.5 hover:brightness-110"
                >
                  <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <div className="mb-3 flex items-center justify-between">
                    <div className="inline-flex items-center gap-2">
                      <span className="inline-flex size-7 items-center justify-center rounded-full bg-[hsl(var(--color-accent)/0.2)]">
                        <Bot className="size-4 text-[hsl(var(--color-accent-soft))]" />
                      </span>
                      <span className="text-xs text-[hsl(var(--color-text-secondary))]">AI assistant</span>
                    </div>
                    <span className="text-[11px] text-[hsl(var(--color-text-secondary))]">
                      {relativeTimeLabel(session.updated_at ?? session.created_at)}
                    </span>
                  </div>
                  <p className="truncate text-sm font-medium text-[hsl(var(--color-text-primary))]">
                    {formatChatTitle(session.title || "Untitled conversation") ||
                      session.title ||
                      "Untitled conversation"}
                  </p>
                  <p className="mt-2 max-h-9 overflow-hidden text-xs text-[hsl(var(--color-text-secondary))]">
                    Continue where you left off in this conversation and keep building momentum.
                  </p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>
    </div>
  )
}
