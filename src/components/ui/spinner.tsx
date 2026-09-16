import { Loading03Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { cva, type VariantProps } from "class-variance-authority"

import { messages } from "@/lib/i18n"
import { cn } from "@/lib/utils"

const spinnerVariants = cva("animate-spin shrink-0", {
  variants: {
    variant: {
      default: "",
      white: "text-white",
      muted: "text-muted-foreground",
      primary: "text-primary",
    },
    size: {
      default: "size-4",
      xs: "size-3",
      sm: "size-3.5",
      md: "size-4",
      lg: "size-6",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Spinner({
  className,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<typeof HugeiconsIcon>, "icon"> &
  VariantProps<typeof spinnerVariants>) {
  return (
    <HugeiconsIcon
      icon={Loading03Icon}
      strokeWidth={2}
      role="status"
      aria-label={messages.common.loading}
      className={cn(spinnerVariants({ variant, size }), className)}
      {...props}
    />
  )
}

export { Spinner, spinnerVariants }
