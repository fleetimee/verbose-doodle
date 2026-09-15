import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const skeletonVariants = cva("bg-accent animate-pulse", {
  variants: {
    variant: {
      default: "rounded-md",
      circle: "rounded-full",
      full: "rounded-full",
      lg: "rounded-lg",
      xl: "rounded-xl",
      "2xl": "rounded-2xl",
      terminal: "rounded-md bg-white/10",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Skeleton({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof skeletonVariants>) {
  return (
    <div
      data-slot="skeleton"
      data-variant={variant}
      className={cn(skeletonVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Skeleton, skeletonVariants }
