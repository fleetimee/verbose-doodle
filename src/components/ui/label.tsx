import { cva, type VariantProps } from "class-variance-authority"
import type * as React from "react"

import { cn } from "@/lib/utils"

const labelVariants = cva(
  "flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "",
        control: "inline-flex h-7 shrink-0 cursor-pointer gap-1.5 rounded-md border border-input bg-background px-2 shadow-xs transition-colors hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:hover:bg-input/50",
        muted: "text-muted-foreground",
        "muted-mono": "font-mono text-muted-foreground",
        mono: "font-mono uppercase tracking-wider text-muted-foreground",
        stacked: "grid gap-1 cursor-pointer",
      },
      size: {
        default: "text-sm",
        sm: "text-xs",
        xs: "text-[11px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Label({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"label"> & VariantProps<typeof labelVariants>) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: reusable label receives htmlFor or wraps controls from callers.
    <label
      data-slot="label"
      data-variant={variant}
      data-size={size}
      className={cn(labelVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Label, labelVariants }
