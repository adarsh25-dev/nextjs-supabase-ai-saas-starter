import { Skeleton } from "@/components/ui/skeleton"

export default function AuthGroupLoading() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-md items-center justify-center p-6">
      <div className="w-full space-y-4 rounded-lg border p-6">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    </div>
  )
}
