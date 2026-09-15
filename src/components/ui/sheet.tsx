import * as React from "react"
import { Dialog as SheetPrimitive } from "@base-ui/react/dialog"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { messages } from "@/lib/i18n"
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

const sheetContentVariants = cva(
  "fixed z-50 flex flex-col bg-background shadow-lg transition-transform ease-in-out data-closed:duration-200 data-open:duration-300 motion-reduce:transition-none",
  {
    variants: {
      size: {
        default: "gap-4",
        flush: "gap-0 p-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  }
)

function SheetContent({
  className,
  children,
  keepMounted = false,
  side = "right",
  size = "default",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Popup> &
  VariantProps<typeof sheetContentVariants> & {
    keepMounted?: boolean
    side?: "top" | "right" | "bottom" | "left"
  }) {
  return (
    <SheetPortal keepMounted={keepMounted}>
      <SheetOverlay />
      <SheetPrimitive.Popup
        data-side={side}
        data-slot="sheet-content"
        data-size={size}
        className={cn(
          sheetContentVariants({ size }),
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
          <span className="sr-only">{messages.common.close}</span>
        </SheetClose>
      </SheetPrimitive.Popup>
    </SheetPortal>
  )
}

const sheetHeaderVariants = cva("flex flex-col", {
  variants: {
    variant: {
      default: "gap-1.5 p-4",
      bordered:
        "border-b bg-background/95 px-5 py-4 pr-12 shadow-[0_20px_40px_-32px_rgba(15,23,42,0.45)]",
      muted: "border-b bg-muted/20 px-5 py-4",
      "muted-lg": "shrink-0 gap-1.5 border-b bg-muted/10 p-6 pr-14",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SheetHeader({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof sheetHeaderVariants>) {
  return (
    <div
      data-slot="sheet-header"
      data-variant={variant}
      className={cn(sheetHeaderVariants({ variant }), className)}
      {...props}
    />
  )
}

const sheetFooterVariants = cva("mt-auto flex flex-col gap-2 p-4", {
  variants: {
    variant: {
      default: "",
      bordered: "border-t bg-muted/20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SheetFooter({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof sheetFooterVariants>) {
  return (
    <div
      data-slot="sheet-footer"
      data-variant={variant}
      className={cn(sheetFooterVariants({ variant }), className)}
      {...props}
    />
  )
}

const sheetTitleVariants = cva("text-foreground font-semibold", {
  variants: {
    variant: {
      default: "",
      lg: "text-lg",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SheetTitle({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title> &
  VariantProps<typeof sheetTitleVariants>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      data-variant={variant}
      className={cn(sheetTitleVariants({ variant }), className)}
      {...props}
    />
  )
}

const sheetDescriptionVariants = cva("text-muted-foreground text-sm", {
  variants: {
    variant: {
      default: "",
      truncate: "truncate",
      code: "break-all font-mono text-xs",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SheetDescription({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description> &
  VariantProps<typeof sheetDescriptionVariants>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      data-variant={variant}
      className={cn(sheetDescriptionVariants({ variant }), className)}
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
  sheetContentVariants,
  sheetHeaderVariants,
  sheetFooterVariants,
  sheetTitleVariants,
  sheetDescriptionVariants,
}
