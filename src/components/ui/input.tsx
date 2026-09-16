import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const inputVariants = cva(
  "w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
  {
    variants: {
      variant: {
        default: "",
        mono: "font-mono",
        muted: "bg-muted/20 border-border/80 shadow-none",
        "muted-mono": "font-mono bg-muted/20 border-border/80 shadow-none",
        ghost: "border-0 bg-transparent shadow-none focus-visible:ring-0",
        "ghost-title":
          "h-auto rounded-none border-0 bg-transparent px-0 py-0 font-bold font-mono text-xl tracking-tight shadow-none focus-visible:ring-0 lg:text-2xl",
        "mono-lg": "font-mono text-lg rounded-xl tracking-widest shadow-xs",
        "mono-display": "font-mono text-lg rounded-xl bg-background shadow-xs",
        "mono-xs": "font-mono text-xs uppercase tracking-wider bg-background",
      },
      size: {
        default: "h-9",
        sm: "h-8 px-2 text-xs",
        xs: "h-7 px-2 text-xs",
        compact: "h-9 px-3 text-xs",
        search: "h-9 pl-9",
        md: "h-11",
        lg: "h-11 px-4 text-base md:text-lg",
        xl: "h-12 px-4 text-base md:text-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Input({
  className,
  type,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<"input">, "size"> &
  VariantProps<typeof inputVariants>) {
  return (
    <input
      type={type}
      data-slot="input"
      data-variant={variant}
      data-size={size}
      className={cn(inputVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Input, inputVariants }
