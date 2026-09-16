import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center justify-center border font-medium w-fit whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground [a&]:hover:bg-primary/90",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground [a&]:hover:bg-secondary/90",
        destructive:
          "border-transparent bg-destructive text-white [a&]:hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40 dark:bg-destructive/60",
        outline:
          "text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
        success:
          "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
        muted:
          "border-transparent bg-muted text-muted-foreground",
        "primary-subtle":
          "border-primary/30 bg-primary/10 text-primary",
        "outline-primary":
          "border-primary/40 bg-background/80 text-primary",
        "outline-muted":
          "border-border text-muted-foreground font-normal",
        tag: "rounded-md border-border text-foreground [a&]:hover:bg-accent [a&]:hover:text-accent-foreground",
      },
      size: {
        default: "px-2 py-0.5 text-xs",
        status: "gap-1.5 font-semibold text-xs px-2 py-0.5",
        sm: "h-5 px-1.5 py-0 text-[10px]",
        xs: "h-4 px-1 py-0 text-[10px]",
        micro: "h-4 px-1.5 py-0 text-[10px] leading-4",
        lg: "px-2.5 py-1 text-xs",
        metric: "h-9 min-w-0 justify-start gap-1.5 px-2.5 py-1 text-xs",
      },
      shape: {
        default: "rounded-full",
        rounded: "rounded-md",
      },
      mono: {
        true: "font-mono",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "default",
    },
  }
)

function Badge({
  className,
  variant,
  size = "default",
  shape = "default",
  mono,
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    render,
    props: mergeProps<"span">(
      {
        "data-slot": "badge",
        className: cn(badgeVariants({ variant, size, shape, mono }), className),
      } as React.ComponentProps<"span">,
      props
    ),
  })
}

export { Badge, badgeVariants }
