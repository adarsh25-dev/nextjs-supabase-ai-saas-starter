import { Skeleton } from "@/components/ui/skeleton"

export default function SettingsPageLoading() {
  return (
    <div className="space-y-4 rounded-lg border p-6">
      <Skeleton className="h-8 w-40" />
      <Skeleton className="h-10 w-full max-w-md" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-14 w-full" />
      <Skeleton className="h-10 w-36" />
    </div>
  )
}
