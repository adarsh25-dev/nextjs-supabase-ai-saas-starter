import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "overflow-hidden rounded-md",
        "bg-[linear-gradient(110deg,hsl(var(--color-text-primary)/0.06)_0%,hsl(var(--color-text-primary)/0.1)_38%,hsl(var(--color-text-primary)/0.24)_50%,hsl(var(--color-text-primary)/0.1)_62%,hsl(var(--color-text-primary)/0.06)_100%)]",
        "bg-[length:220%_100%]",
        "animate-[shimmer_2.2s_linear_infinite]",
        "motion-reduce:animate-none motion-reduce:bg-[hsl(var(--color-text-primary)/0.1)]",
        className,
      )}
      {...props}
    />
  )
}

export { Skeleton }
