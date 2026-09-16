import * as React from "react"
import * as ResizablePrimitive from "react-resizable-panels"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react";
import { DragDropVerticalIcon } from "@hugeicons/core-free-icons";

type ResizablePanelGroupProps = React.ComponentProps<
  typeof ResizablePrimitive.Group
> &
  VariantProps<typeof resizablePanelGroupVariants> & {
    direction?: React.ComponentProps<typeof ResizablePrimitive.Group>["orientation"]
  }

const resizablePanelGroupVariants = cva(
  "flex h-full w-full data-[panel-group-direction=vertical]:flex-col",
  {
    variants: {
      variant: {
        default: "",
        bordered:
          "rounded-xl border border-slate-200 bg-white dark:border-[#2b2f37] dark:bg-[#0d1117]",
        card: "overflow-hidden rounded-lg border border-border/70 bg-card shadow-xs",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ResizablePanelGroup({
  className,
  variant = "default",
  direction,
  ...props
}: ResizablePanelGroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      data-variant={variant}
      className={cn(resizablePanelGroupVariants({ variant }), className)}
      orientation={direction}
      {...props}
    />
  )
}

function ResizablePanel({
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Panel>) {
  return <ResizablePrimitive.Panel data-slot="resizable-panel" {...props} />
}

const resizableHandleVariants = cva(
  "focus-visible:ring-ring relative flex items-center justify-center after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 focus-visible:ring-1 focus-visible:ring-offset-1 focus-visible:outline-hidden data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1 data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0 data-[panel-group-direction=vertical]:after:-translate-y-1/2 [&[data-panel-group-direction=vertical]>div]:rotate-90",
  {
    variants: {
      variant: {
        default: "bg-border w-px",
        primary: "w-1 bg-border transition-colors hover:bg-primary/60",
        colored:
          "w-1 bg-slate-300 transition-colors hover:bg-sky-500 dark:bg-[#2b2f37] dark:hover:bg-sky-400",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ResizableHandle({
  withHandle,
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof ResizablePrimitive.Separator> &
  VariantProps<typeof resizableHandleVariants> & {
    withHandle?: boolean
  }) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      data-variant={variant}
      className={cn(resizableHandleVariants({ variant }), className)}
      {...props}
    >
      {withHandle && (
        <div className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <HugeiconsIcon icon={DragDropVerticalIcon} strokeWidth={2} className="size-2.5" />
        </div>
      )}
    </ResizablePrimitive.Separator>
  )
}

export {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
  resizablePanelGroupVariants,
  resizableHandleVariants,
}
