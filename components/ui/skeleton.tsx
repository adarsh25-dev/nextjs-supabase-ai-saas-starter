import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "animate-shimmer rounded-md bg-[linear-gradient(110deg,hsl(var(--color-text-primary)/0.08),hsl(var(--color-text-primary)/0.14),hsl(var(--color-text-primary)/0.08))] bg-[length:220%_100%]",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
