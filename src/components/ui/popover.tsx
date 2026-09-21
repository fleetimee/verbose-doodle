"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { useRender } from "@base-ui/react/use-render"

import { cn } from "@/lib/utils"

function Popover({
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Root>) {
  return <PopoverPrimitive.Root data-slot="popover" {...props} />
}

function PopoverTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <PopoverPrimitive.Trigger
      data-slot="popover-trigger"
      render={
        // SAFETY: React.isValidElement below proves the child is a React element.
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </PopoverPrimitive.Trigger>
  )
}

import { cva, type VariantProps } from "class-variance-authority"

const popoverContentVariants = cva(
  "z-50 w-72 origin-(--transform-origin) rounded-md border bg-popover text-popover-foreground shadow-md outline-hidden transition-[opacity,transform] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
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

function PopoverContent({
  className,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  portalContainer,
  size = "default",
  ...props
}: React.ComponentProps<typeof PopoverPrimitive.Popup> &
  { portalContainer?: React.ComponentProps<typeof PopoverPrimitive.Portal>["container"] } & Pick<
    PopoverPrimitive.Positioner.Props,
    "align" | "alignOffset" | "side" | "sideOffset"
  > &
  VariantProps<typeof popoverContentVariants>) {
  return (
    <PopoverPrimitive.Portal container={portalContainer}>
      <PopoverPrimitive.Positioner
        align={align}
        alignOffset={alignOffset}
        className="isolate z-50"
        side={side}
        sideOffset={sideOffset}
      >
        <PopoverPrimitive.Popup
          data-slot="popover-content"
          data-size={size}
          className={cn(popoverContentVariants({ size }), className)}
          {...props}
        />
      </PopoverPrimitive.Positioner>
    </PopoverPrimitive.Portal>
  )
}

function PopoverAnchor({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  // SAFETY: mergeProps returns the component props contract declared by useRender.
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "popover-anchor",
        className,
      } as React.ComponentProps<"div">,
      props
    ),
  })
}

export {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverAnchor,
  popoverContentVariants,
}
