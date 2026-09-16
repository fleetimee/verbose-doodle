import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const textareaVariants = cva(
  "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 flex field-sizing-content min-h-16 w-full rounded-md border bg-transparent px-3 py-2 text-base shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
  {
    variants: {
      variant: {
        default: "",
        mono: "font-mono text-sm leading-relaxed",
        "mono-muted": "bg-muted/10 font-mono text-xs leading-6 shadow-none",
        ghost: "rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0",
        "ghost-mono":
          "rounded-none border-0 bg-transparent p-0 shadow-none focus-visible:ring-0 font-mono leading-relaxed placeholder:text-muted-foreground",
        overlay:
          "bg-transparent dark:bg-transparent font-mono text-transparent leading-6 caret-foreground selection:bg-primary/20 selection:text-transparent",
      },
      size: {
        default: "",
        xs: "text-xs",
        sm: "text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Textarea({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"textarea"> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant}
      data-size={size}
      className={cn(textareaVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
