import { Skeleton } from "@/components/ui/skeleton"

export default function ChatPageLoading() {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4">
      <div className="glass gradient-border hidden w-80 shrink-0 space-y-2 rounded-2xl border border-[hsl(var(--color-border))] p-3 md:block">
        <Skeleton className="h-9 w-full" />
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-10 w-full" />
        ))}
      </div>
      <div className="glass gradient-border flex-1 space-y-3 rounded-2xl border border-[hsl(var(--color-border))] p-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}
