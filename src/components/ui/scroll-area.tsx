"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const scrollAreaVariants = cva("relative group/scroll-area", {
  variants: {
    variant: {
      default: "",
      terminal: "rounded-lg border border-[#2f2f2f] bg-[#151515] shadow-inner",
      bordered: "rounded-lg border border-border/70",
      subtle: "border-t border-border/70",
      split: "border-b bg-muted/10 lg:border-r lg:border-b-0",
      fit: "[&>[data-slot=scroll-area-viewport]>[role=presentation]]:!min-w-0",
      visible: "[&>[data-slot=scroll-area-scrollbar]]:opacity-100",
      overview:
        "[&>[data-slot=scroll-area-viewport]>[role=presentation]]:!min-w-0 overflow-hidden [&>[data-slot=scroll-area-viewport]]:overflow-hidden",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function ScrollArea({
  className,
  variant = "default",
  children,
  contentClassName,
  viewportRef,
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Root> &
  VariantProps<typeof scrollAreaVariants> & {
    contentClassName?: string;
    viewportRef?: React.ComponentProps<typeof ScrollAreaPrimitive.Viewport>["ref"];
  }) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      data-variant={variant}
      data-vaul-no-drag
      className={cn(scrollAreaVariants({ variant }), className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        data-slot="scroll-area-viewport"
        data-vaul-no-drag
        className="focus-visible:ring-ring/50 size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:outline-1"
        ref={viewportRef}
      >
        <ScrollAreaPrimitive.Content className={cn(contentClassName)}>
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  )
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: React.ComponentProps<typeof ScrollAreaPrimitive.Scrollbar>) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-opacity duration-200 select-none opacity-0 group-hover/scroll-area:opacity-100 data-[scrolling]:opacity-100 data-[pointer-down]:opacity-100",
        orientation === "vertical" &&
          "h-full w-2.5 border-l border-l-transparent",
        orientation === "horizontal" &&
          "h-2.5 flex-col border-t border-t-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="bg-border relative flex-1 rounded-full"
      />
    </ScrollAreaPrimitive.Scrollbar>
  )
}

export { ScrollArea, ScrollBar, scrollAreaVariants }
