import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />
}

function SheetTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <SheetPrimitive.Trigger
      data-slot="sheet-trigger"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </SheetPrimitive.Trigger>
  )
}

function SheetClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close> & {
  asChild?: boolean
}) {
  return (
    <SheetPrimitive.Close
      data-slot="sheet-close"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </SheetPrimitive.Close>
  )
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Backdrop>) {
  return (
    <SheetPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

function SheetContent({
  className,
  children,
  keepMounted = false,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> & {
  keepMounted?: boolean
  side?: "top" | "right" | "bottom" | "left"
}) {
  return (
    <SheetPortal keepMounted={keepMounted}>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-side={side}
        data-slot="sheet-content"
        className={cn(
          "fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition-transform ease-in-out data-closed:duration-300 data-open:duration-500",
          side === "right" &&
            "inset-y-0 right-0 h-full w-3/4 border-l data-ending-style:translate-x-full data-starting-style:translate-x-full sm:max-w-sm",
          side === "left" &&
            "inset-y-0 left-0 h-full w-3/4 border-r data-ending-style:-translate-x-full data-starting-style:-translate-x-full sm:max-w-sm",
          side === "top" &&
            "inset-x-0 top-0 h-auto border-b data-ending-style:-translate-y-full data-starting-style:-translate-y-full",
          side === "bottom" &&
            "inset-x-0 bottom-0 h-auto border-t data-ending-style:translate-y-full data-starting-style:translate-y-full",
          className
        )}
        {...props}
      >
        {children}
        <SheetClose className="ring-offset-background focus:ring-ring data-popup-open:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} className="size-4" />
          <span className="sr-only">Close</span>
        </SheetClose>
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
