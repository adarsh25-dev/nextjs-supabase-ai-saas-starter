import { cn } from "@/lib/utils"

type UsageMeterProps = {
  used: number
  limit: number
}

export function UsageMeter({ used, limit }: UsageMeterProps) {
  const percentage = limit > 0 ? Math.min((used / limit) * 100, 100) : 0
  const barColor =
    percentage > 90
      ? "bg-red-500"
      : percentage >= 70
        ? "bg-yellow-500"
        : "bg-green-500"

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Current month usage</span>
        <span className="font-medium">
          {used.toLocaleString()} / {limit.toLocaleString()} messages
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted">
        <div
          className={cn("h-2 rounded-full transition-all", barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}
