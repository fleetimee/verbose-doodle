"use client"

import * as React from "react"
import { PreviewCard as HoverCardPrimitive } from "@base-ui/react/preview-card"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function HoverCard({
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Root>) {
  return <HoverCardPrimitive.Root data-slot="hover-card" {...props} />
}

function HoverCardTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <HoverCardPrimitive.Trigger
      data-slot="hover-card-trigger"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </HoverCardPrimitive.Trigger>
  )
}

const hoverCardContentVariants = cva(
  "z-50 w-64 origin-(--transform-origin) rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden transition-[opacity,transform] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
  {
    variants: {
      size: {
        default: "p-4",
        none: "p-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function HoverCardContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  size = "default",
  ...props
}: React.ComponentProps<typeof HoverCardPrimitive.Popup> &
  Pick<
    HoverCardPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > &
  VariantProps<typeof hoverCardContentVariants>) {
  return (
    <HoverCardPrimitive.Portal data-slot="hover-card-portal">
      <HoverCardPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        side={side}
        sideOffset={sideOffset}
      >
        <HoverCardPrimitive.Popup
          data-slot="hover-card-content"
          data-size={size}
          className={cn(hoverCardContentVariants({ size }), className)}
          {...props}
        />
      </HoverCardPrimitive.Positioner>
    </HoverCardPrimitive.Portal>
  )
}

export {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
  hoverCardContentVariants,
}
