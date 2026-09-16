import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { messages } from "@/lib/i18n"
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger> & {
  asChild?: boolean
}) {
  return (
    <DialogPrimitive.Trigger
      data-slot="dialog-trigger"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Trigger>
  )
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

function DialogClose({
  asChild,
  children,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close> & {
  asChild?: boolean
}) {
  return (
    <DialogPrimitive.Close
      data-slot="dialog-close"
      render={
        asChild && React.isValidElement(children)
          ? (children as React.ReactElement)
          : undefined
      }
      {...props}
    >
      {asChild ? undefined : children}
    </DialogPrimitive.Close>
  )
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      data-slot="dialog-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-black/50 transition-opacity data-ending-style:opacity-0 data-starting-style:opacity-0",
        className
      )}
      {...props}
    />
  )
}

const dialogContentVariants = cva(
  "fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg transition-[opacity,transform] duration-200 outline-none data-ending-style:translate-x-[-50%] data-ending-style:translate-y-[-50%] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:translate-x-[-50%] data-starting-style:translate-y-[-50%] data-starting-style:scale-95 data-starting-style:opacity-0",
  {
    variants: {
      variant: {
        default: "",
        pane: "flex flex-col gap-0 overflow-hidden rounded-xl border p-0 shadow-2xl",
        "dark-pane":
          "flex flex-col gap-0 overflow-hidden border border-slate-200 bg-white p-0 text-slate-950 shadow-2xl dark:border-[#2b2f37] dark:bg-[#0b0f14] dark:text-slate-100",
        elevated:
          "rounded-2xl border-2 border-border/80 border-b-4 bg-card shadow-lg",
      },
      size: {
        default: "sm:max-w-lg",
        sm: "sm:max-w-sm",
        md: "sm:max-w-md",
        lg: "sm:max-w-lg",
        xl: "sm:max-w-xl",
        "2xl": "sm:max-w-2xl",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function DialogContent({
  className,
  children,
  showCloseButton = true,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Popup> &
  VariantProps<typeof dialogContentVariants> & {
    showCloseButton?: boolean
  }) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Popup
        data-slot="dialog-content"
        data-variant={variant}
        data-size={size}
        className={cn(dialogContentVariants({ variant, size }), className)}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogClose
            data-slot="dialog-close"
            className="absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-popup-open:bg-accent data-popup-open:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <HugeiconsIcon icon={Cancel01Icon} strokeWidth={2} />
            <span className="sr-only">{messages.common.close}</span>
          </DialogClose>
        )}
      </DialogPrimitive.Popup>
    </DialogPortal>
  )
}

const dialogHeaderVariants = cva(
  "flex flex-col gap-2 text-center sm:text-left",
  {
    variants: {
      variant: {
        default: "",
        banner:
          "flex-row items-center justify-between gap-3 border-b bg-muted/20 px-6 py-3.5 pr-14 text-left",
      },
      size: {
        default: "gap-2",
        relaxed: "gap-3",
        none: "gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function DialogHeader({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof dialogHeaderVariants>) {
  return (
    <div
      data-slot="dialog-header"
      data-variant={variant}
      data-size={size}
      className={cn(dialogHeaderVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const dialogFooterVariants = cva(
  "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
  {
    variants: {
      variant: {
        default: "",
        pane: "border-t bg-muted/20 px-6 py-4",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function DialogFooter({
  className,
  variant = "default",
  showCloseButton = false,
  children,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof dialogFooterVariants> & {
    showCloseButton?: boolean
  }) {
  return (
    <div
      data-slot="dialog-footer"
      data-variant={variant}
      className={cn(dialogFooterVariants({ variant }), className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <DialogClose render={<Button variant="outline" />}>
          {messages.common.close}
        </DialogClose>
      )}
    </div>
  )
}

const dialogTitleVariants = cva("leading-none font-semibold", {
  variants: {
    variant: {
      default: "",
      bold: "font-bold",
    },
    size: {
      default: "text-lg",
      sm: "text-base tracking-tight",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function DialogTitle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title> &
  VariantProps<typeof dialogTitleVariants>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      data-variant={variant}
      data-size={size}
      className={cn(dialogTitleVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const dialogDescriptionVariants = cva("text-muted-foreground", {
  variants: {
    size: {
      default: "text-sm",
      xs: "text-xs",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function DialogDescription({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description> &
  VariantProps<typeof dialogDescriptionVariants>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      data-size={size}
      className={cn(dialogDescriptionVariants({ size }), className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
  dialogContentVariants,
  dialogHeaderVariants,
  dialogTitleVariants,
  dialogDescriptionVariants,
}
