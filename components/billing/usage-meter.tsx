import { cn } from "@/lib/utils"

type UsageMeterProps = {
  used: number
  limit: number
}

export function UsageMeter({ used, limit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const barClass =
    percentage > 90
      ? "bg-gradient-to-r from-[hsl(4_41%_53%)] to-[hsl(8_46%_58%)]"
      : percentage >= 70
        ? "bg-gradient-to-r from-[hsl(32_47%_61%)] to-[hsl(42_53%_66%)]"
        : "bg-gradient-to-r from-[hsl(120_34%_56%)] to-[hsl(148_28%_62%)]"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[hsl(var(--color-text-secondary))]">Current month usage</span>
        <span className="font-medium text-[hsl(var(--color-text-primary))]">
          {used.toLocaleString()} / {limit.toLocaleString()} messages
        </span>
      </div>
      <div className="h-2.5 w-full rounded-full bg-[hsl(var(--color-text-primary)/0.08)]">
        <div
          className={cn("h-2.5 rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]", barClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
