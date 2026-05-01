import { cn } from "@/lib/utils"

type AuthHeadingProps = {
  title: string
  description?: string
  className?: string
}

export function AuthHeading({ title, description, className }: AuthHeadingProps) {
  return (
    <div className={cn("space-y-2", className)}>
      <h1 className="text-3xl font-medium tracking-[-0.04em] text-[hsl(var(--color-text-primary))]">{title}</h1>
      {description ? <p className="text-sm text-[hsl(var(--color-text-secondary))]">{description}</p> : null}
    </div>
  )
}
