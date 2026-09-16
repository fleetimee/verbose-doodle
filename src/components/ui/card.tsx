import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const cardVariants = cva(
  "flex flex-col text-card-foreground",
  {
    variants: {
      variant: {
        default: "border bg-card shadow-sm",
        elevated: "rounded-2xl border-2 border-border/80 border-b-4 bg-card shadow-sm",
        "elevated-subtle": "rounded-2xl border-2 border-border/80 border-b-4 bg-card/90 shadow-sm",
        subtle: "rounded-lg border border-border/70 bg-card/90 shadow-sm",
        outline: "rounded-xl border border-border/70 bg-card shadow-xs",
        muted: "border-border/80 bg-muted/20",
        "muted-subtle": "rounded-xl border border-border/70 bg-muted/10 shadow-none",
        panel: "rounded-lg border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.16))] shadow-sm",
        "panel-subtle": "rounded-lg border-border/70 bg-[linear-gradient(180deg,hsl(var(--card)),hsl(var(--muted)/0.12))] shadow-sm",
        "metric-default": "overflow-hidden rounded-2xl border border-border/70 bg-card shadow-xs transition-transform duration-150 active:scale-[0.99]",
        "metric-danger": "overflow-hidden rounded-2xl border border-destructive/30 bg-destructive/5 shadow-xs transition-transform duration-150 active:scale-[0.99]",
        "metric-success": "overflow-hidden rounded-2xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs transition-transform duration-150 active:scale-[0.99]",
        "metric-warning": "overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 shadow-xs transition-transform duration-150 active:scale-[0.99]",
        glass: "overflow-hidden rounded-xl border border-border/80 bg-card/60 shadow-lg backdrop-blur-md",
        overview:
          "rounded-xl border border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-primary/35 hover:shadow-[0_24px_55px_-34px_color-mix(in_oklab,var(--primary)_65%,transparent)] motion-reduce:transition-none",
        "overview-interactive":
          "group overflow-hidden rounded-xl border border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)] transition-[border-color,box-shadow,transform] duration-300 ease-out hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-[0_24px_55px_-34px_color-mix(in_oklab,var(--primary)_65%,transparent)] active:translate-y-px motion-reduce:transform-none motion-reduce:transition-none",
        "overview-card":
          "rounded-xl border border-border/70 bg-card/90 shadow-[0_18px_45px_-32px_color-mix(in_oklab,var(--foreground)_45%,transparent)]",
      },
      size: {
        default: "gap-6 rounded-xl py-6",
        compact: "gap-4 rounded-xl p-4",
        sm: "gap-3 rounded-lg p-3.5",
        panel: "py-0",
        none: "gap-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Card({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return (
    <div
      data-slot="card"
      data-variant={variant}
      data-size={size}
      className={cn(cardVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const cardHeaderVariants = cva(
  "@container/card-header grid auto-rows-min grid-rows-[auto_auto] items-start has-data-[slot=card-action]:grid-cols-[1fr_auto] [.border-b]:pb-6",
  {
    variants: {
      variant: {
        default: "",
        subtle: "border-b border-border/70 bg-muted/20 pb-3",
        panel: "border-b border-border/70 bg-background/55",
        "panel-subtle": "border-b border-border/70 bg-background/45",
        preview: "border-b border-border/40 bg-muted/20 pb-4",
      },
      size: {
        default: "gap-2 px-6",
        compact: "gap-1.5 px-4 pb-2",
        sm: "gap-1.5 p-3.5",
        panel: "gap-3 px-4 py-3.5 md:px-5",
        "panel-lg": "gap-4 px-4 py-4 md:px-5",
        metric: "flex flex-row items-start justify-between gap-3 pb-2 px-6 pt-6",
        card: "gap-4 pb-3",
        loose: "gap-4",
        chart: "gap-2 px-6 pb-2",
        none: "gap-0 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function CardHeader({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardHeaderVariants>) {
  return (
    <div
      data-slot="card-header"
      data-variant={variant}
      data-size={size}
      className={cn(cardHeaderVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const cardTitleVariants = cva("leading-none font-semibold", {
  variants: {
    variant: {
      default: "",
      inline: "flex items-center gap-2",
      kpi: "mt-1.5 break-words font-bold font-mono text-xl leading-tight md:text-2xl",
    },
    size: {
      default: "text-lg",
      sm: "text-base",
      xl: "text-xl",
      "2xl": "text-xl md:text-2xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function CardTitle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardTitleVariants>) {
  return (
    <div
      data-slot="card-title"
      data-variant={variant}
      data-size={size}
      className={cn(cardTitleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const cardDescriptionVariants = cva("text-muted-foreground", {
  variants: {
    variant: {
      default: "",
      badge: "font-semibold text-xs uppercase tracking-wider",
    },
    size: {
      default: "text-sm",
      xs: "text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function CardDescription({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardDescriptionVariants>) {
  return (
    <div
      data-slot="card-description"
      data-variant={variant}
      data-size={size}
      className={cn(cardDescriptionVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn(
        "col-start-2 row-span-2 row-start-1 self-start justify-self-end",
        className
      )}
      {...props}
    />
  )
}

const cardContentVariants = cva("", {
  variants: {
    variant: {
      default: "",
      muted: "text-sm text-muted-foreground leading-relaxed",
    },
    size: {
      default: "px-6",
      compact: "px-4 py-3",
      sm: "p-3.5",
      panel: "px-4 py-4 md:px-5",
      padded: "p-6",
      spaced: "px-6 space-y-4",
      card: "grid gap-4 md:grid-cols-2",
      chart: "px-6 pb-0",
      overview: "flex flex-col gap-6 p-5 sm:p-6",
      "overview-role": "flex flex-col gap-5 px-6 pb-6",
      none: "p-0",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function CardContent({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardContentVariants>) {
  return (
    <div
      data-slot="card-content"
      data-variant={variant}
      data-size={size}
      className={cn(cardContentVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center px-6 [.border-t]:pt-6", className)}
      {...props}
    />
  )
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
  cardVariants,
  cardHeaderVariants,
  cardTitleVariants,
  cardContentVariants,
  cardDescriptionVariants,
}
