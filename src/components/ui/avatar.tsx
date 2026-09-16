import * as React from "react"
import { Avatar as AvatarPrimitive } from "@base-ui/react/avatar"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const avatarVariants = cva("relative flex size-8 shrink-0 overflow-hidden", {
  variants: {
    variant: {
      default: "rounded-full",
      square: "rounded-lg",
    },
    size: {
      default: "size-8",
      sm: "size-7",
      lg: "size-9",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function Avatar({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Root> &
  VariantProps<typeof avatarVariants>) {
  return (
    <AvatarPrimitive.Root
      data-slot="avatar"
      data-variant={variant}
      data-size={size}
      className={cn(avatarVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function AvatarImage({
  className,
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Image>) {
  return (
    <AvatarPrimitive.Image
      data-slot="avatar-image"
      className={cn("aspect-square size-full", className)}
      {...props}
    />
  )
}

const avatarFallbackVariants = cva(
  "bg-muted flex size-full items-center justify-center font-medium",
  {
    variants: {
      variant: {
        default: "rounded-full",
        square: "rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function AvatarFallback({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof AvatarPrimitive.Fallback> &
  VariantProps<typeof avatarFallbackVariants>) {
  return (
    <AvatarPrimitive.Fallback
      data-slot="avatar-fallback"
      data-variant={variant}
      className={cn(avatarFallbackVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Avatar, AvatarImage, AvatarFallback, avatarVariants, avatarFallbackVariants }
