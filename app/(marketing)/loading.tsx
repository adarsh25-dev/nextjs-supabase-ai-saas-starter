import { Skeleton } from "@/components/ui/skeleton"

export default function MarketingGroupLoading() {
  return (
    <div className="space-y-10 p-6">
      <Skeleton className="h-16 w-full" />
      <div className="mx-auto max-w-4xl space-y-4 text-center">
        <Skeleton className="mx-auto h-6 w-40" />
        <Skeleton className="mx-auto h-12 w-3/4" />
        <Skeleton className="mx-auto h-5 w-2/3" />
      </div>
      <Skeleton className="mx-auto h-64 w-full max-w-6xl" />
    </div>
  )
}
