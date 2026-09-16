import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const emptyVariants = cva(
  "flex min-w-0 flex-1 flex-col items-center justify-center rounded-lg text-center text-balance",
  {
    variants: {
      variant: {
        default: "border-dashed",
        bordered: "border",
        plain: "border-0",
      },
      size: {
        default: "gap-6 p-6 md:p-12",
        compact: "gap-4 p-4",
        lg: "gap-8 p-8 md:p-16",
        none: "gap-0 p-0",
        hero: "gap-8 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Empty({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyVariants>) {
  return (
    <div
      data-slot="empty"
      data-variant={variant}
      data-size={size}
      className={cn(emptyVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const emptyHeaderVariants = cva(
  "flex max-w-sm flex-col items-center gap-2 text-center",
  {
    variants: {
      size: {
        default: "gap-2",
        compact: "gap-1",
        lg: "gap-4",
        none: "gap-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function EmptyHeader({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyHeaderVariants>) {
  return (
    <div
      data-slot="empty-header"
      data-size={size}
      className={cn(emptyHeaderVariants({ size }), className)}
      {...props}
    />
  )
}

const emptyMediaVariants = cva(
  "flex shrink-0 items-center justify-center mb-2 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-lg [&_svg:not([class*='size-'])]:size-6",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyMediaVariants>) {
  return (
    <div
      data-slot="empty-icon"
      data-variant={variant}
      className={cn(emptyMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

const emptyTitleVariants = cva("text-lg font-medium tracking-tight", {
  variants: {
    variant: {
      default: "",
      display:
        "font-black font-mono text-[clamp(5rem,18vw,9rem)] text-primary leading-[0.82] tracking-[-0.08em]",
      hero: "font-black text-4xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function EmptyTitle({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyTitleVariants>) {
  return (
    <div
      data-slot="empty-title"
      data-variant={variant}
      className={cn(emptyTitleVariants({ variant }), className)}
      {...props}
    />
  )
}

const emptyDescriptionVariants = cva(
  "text-muted-foreground [&>a:hover]:text-primary text-sm/relaxed [&>a]:underline [&>a]:underline-offset-4",
  {
    variants: {
      variant: {
        default: "",
        lead: "sm:text-base",
        nowrap: "text-nowrap",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function EmptyDescription({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyDescriptionVariants>) {
  return (
    <div
      data-slot="empty-description"
      data-variant={variant}
      className={cn(emptyDescriptionVariants({ variant }), className)}
      {...props}
    />
  )
}

const emptyContentVariants = cva(
  "flex w-full max-w-sm min-w-0 flex-col items-center gap-4 text-sm text-balance",
  {
    variants: {
      size: {
        default: "gap-4",
        compact: "gap-2",
        sm: "gap-3",
        lg: "gap-6",
        none: "gap-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function EmptyContent({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof emptyContentVariants>) {
  return (
    <div
      data-slot="empty-content"
      data-size={size}
      className={cn(emptyContentVariants({ size }), className)}
      {...props}
    />
  )
}

export {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
  EmptyMedia,
  emptyVariants,
  emptyHeaderVariants,
  emptyTitleVariants,
  emptyDescriptionVariants,
  emptyContentVariants,
}
