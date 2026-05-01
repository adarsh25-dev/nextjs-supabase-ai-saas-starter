import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "group/button relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-clip-padding text-sm font-medium whitespace-nowrap transition duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] outline-none select-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--color-accent))] active:not-aria-[haspopup]:scale-[0.98] active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-surface))]",
        primary:
          "border-transparent bg-[image:var(--gradient-ember)] text-[hsl(var(--color-accent-foreground))] shadow-[0_0_45px_-16px_hsl(var(--color-accent)/0.5)] hover:scale-[1.02] hover:shadow-[0_0_60px_-15px_hsl(var(--color-accent)/0.65)]",
        outline:
          "border-[hsl(var(--color-border))] bg-transparent text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-bg-elevated))]",
        secondary:
          "glass border-[hsl(var(--color-border))] text-[hsl(var(--color-text-primary))] hover:brightness-110",
        ghost:
          "border-transparent bg-transparent text-[hsl(var(--color-text-primary))] hover:bg-[hsl(var(--color-text-primary)/0.05)]",
        destructive: "border-[hsl(var(--color-danger)/0.4)] bg-[hsl(var(--color-danger)/0.16)] text-[hsl(var(--color-text-primary))]",
        link: "link-underline border-transparent bg-transparent text-[hsl(var(--color-accent-soft))]",
        shine:
          "border-[hsl(var(--color-border))] bg-[hsl(var(--color-bg-elevated))] text-[hsl(var(--color-text-primary))] before:pointer-events-none before:absolute before:inset-0 before:translate-x-[-120%] before:bg-[linear-gradient(115deg,transparent_30%,hsl(var(--color-text-primary)/0.25)_50%,transparent_70%)] before:transition-transform before:duration-700 hover:before:translate-x-[120%]",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
