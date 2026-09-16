import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow,opacity,transform] duration-[160ms] ease-[var(--ease-out)] outline-none active:scale-[0.97] motion-reduce:transform-none motion-reduce:transition-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
        outline:
          "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
        link: "text-primary underline-offset-4 hover:underline",
        elevated:
          "rounded-xl border-2 border-primary/40 border-b-4 bg-primary font-bold text-primary-foreground shadow-xs hover:bg-primary/95 active:translate-y-0.5 active:border-b-2",
        "outline-elevated":
          "rounded-xl border border-border/80 bg-background font-semibold shadow-xs hover:bg-accent active:translate-y-0.5",
        "outline-muted":
          "border border-border/80 bg-background text-muted-foreground shadow-xs hover:bg-accent hover:text-foreground dark:bg-input/30 dark:border-input dark:hover:bg-input/50",
        dashed:
          "rounded-xl border border-dashed bg-muted/20 px-3.5 py-2.5 font-medium text-xs hover:border-primary/50 hover:bg-muted/50",
        success:
          "border border-green-600/40 bg-green-50 text-green-700 shadow-xs hover:bg-green-100 hover:text-green-800 dark:bg-green-950/30 dark:text-green-400 dark:hover:bg-green-950/50",
        "destructive-subtle":
          "border border-destructive/40 bg-destructive/10 text-destructive shadow-xs hover:bg-destructive/15 hover:text-destructive",
        "ghost-muted":
          "text-muted-foreground hover:bg-accent hover:text-accent-foreground active:bg-accent/80 dark:hover:bg-accent/50",
        "ghost-destructive":
          "text-muted-foreground hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive active:bg-destructive/15 dark:hover:bg-destructive/10",
        "ghost-slate":
          "text-slate-500 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white",
        subtle:
          "rounded-lg border border-border/70 bg-background font-medium hover:bg-accent",
        soft:
          "rounded-xl border border-border/80 bg-background/80 font-medium shadow-xs hover:bg-accent",
        card:
          "rounded-xl border border-border/80 bg-card font-medium text-foreground hover:bg-accent/50",
        panel:
          "rounded-xl border-2 border-border/80 border-b-[3px] bg-background font-bold transition-all duration-150 hover:bg-accent active:translate-y-0.5 active:border-b-2",
        "panel-muted":
          "rounded-lg border-2 border-border/80 border-b-[3px] bg-background/70 text-muted-foreground transition-all duration-150 hover:border-border hover:bg-accent hover:text-accent-foreground active:translate-y-0.5 active:border-b-2",
        breadcrumb:
          "justify-between border-transparent bg-transparent font-medium text-foreground shadow-none hover:bg-accent hover:text-accent-foreground",
        floating:
          "rounded-full border border-border/70 bg-background/95 shadow-lg backdrop-blur hover:bg-accent hover:text-accent-foreground",
        "underline-display":
          "justify-between rounded-none border-0 border-border border-b-2 bg-transparent font-normal shadow-none hover:bg-transparent focus:ring-0 focus-visible:border-primary aria-invalid:border-destructive",
        "underline-display-muted":
          "justify-between rounded-none border-0 border-border border-b-2 bg-transparent font-normal text-muted-foreground shadow-none hover:bg-transparent focus:ring-0 focus-visible:border-primary aria-invalid:border-destructive",
      },
      size: {
        default: "h-9 px-4 py-2 has-[>svg]:px-3",
        xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
        "sm-compact": "h-8 gap-1 rounded-md px-1.5 text-xs",
        breadcrumb: "h-8 px-1.5",
        lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
        compact: "h-9 gap-1.5 rounded-md px-2.5 text-xs",
        tile: "h-auto min-h-14 flex-col gap-1 p-2",
        "display-xl": "h-20 px-0 text-3xl md:text-4xl",
        icon: "size-9",
        "icon-7": "size-7",
        "icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
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
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
