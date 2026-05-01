import { Skeleton } from "@/components/ui/skeleton"

export default function DashboardPageLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-9 w-96 max-w-full rounded-xl" />
        <Skeleton className="h-4 w-72 max-w-full rounded-lg" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-48 w-full rounded-2xl" />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-12">
        <Skeleton className="h-[360px] rounded-2xl lg:col-span-8" />
        <div className="space-y-4 lg:col-span-4">
          <Skeleton className="h-44 rounded-2xl" />
          <Skeleton className="h-40 rounded-2xl" />
        </div>
      </div>

      <div className="space-y-4">
        <Skeleton className="h-7 w-56 rounded-lg" />
        <div className="flex gap-3 overflow-hidden">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-36 min-w-[250px] rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )
}
