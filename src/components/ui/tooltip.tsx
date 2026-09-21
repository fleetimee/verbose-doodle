"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: Omit<React.ComponentProps<typeof TooltipPrimitive.Provider>, "delay"> & {
  delayDuration?: number
}) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delay={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  delayDuration,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root> & {
  delayDuration?: number
}) {
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  )
}

function TooltipTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <TooltipPrimitive.Trigger
      data-slot="tooltip-trigger"
      render={
        // SAFETY: React.isValidElement below proves the child is a React element.
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </TooltipPrimitive.Trigger>
  )
}

import { cva, type VariantProps } from "class-variance-authority"

const tooltipContentVariants = cva(
  "z-50 w-fit origin-(--transform-origin) rounded-md bg-foreground px-3 py-1.5 text-background text-balance text-xs transition-[opacity,transform] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
  {
    variants: {
      variant: {
        default: "",
        mono: "font-mono leading-relaxed",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function TooltipContent({
  className,
  variant = "default",
  align = "center",
  alignOffset = 0,
  side = "top",
  sideOffset = 4,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Popup> &
  VariantProps<typeof tooltipContentVariants> &
  Pick<
    TooltipPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <TooltipPrimitive.Popup
          data-slot="tooltip-content"
          data-variant={variant}
          className={cn(tooltipContentVariants({ variant }), className)}
          {...props}
        >
          {children}
          <TooltipPrimitive.Arrow className="fill-foreground" />
        </TooltipPrimitive.Popup>
      </TooltipPrimitive.Positioner>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider }
