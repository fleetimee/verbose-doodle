import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"

import { cn } from "@/lib/utils"

type DrawerProps = React.ComponentProps<typeof DrawerPrimitive.Root> & {
  nested?: boolean
}

function Drawer({
  nested = false,
  ...props
}: DrawerProps) {
  if (nested) {
    return <DrawerPrimitive.NestedRoot data-slot="drawer-nested" {...props} />
  }
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerNestedRoot({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.NestedRoot>) {
  return <DrawerPrimitive.NestedRoot data-slot="drawer-nested" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

function DrawerContent({
  className,
  children,
  showSwipeHandle = true,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content> & {
  showSwipeHandle?: boolean
}) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-2xl data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:top-2 data-[vaul-drawer-direction=right]:bottom-2 data-[vaul-drawer-direction=right]:right-2 data-[vaul-drawer-direction=right]:h-[calc(100vh-1rem)] data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border data-[vaul-drawer-direction=right]:rounded-2xl data-[vaul-drawer-direction=right]:shadow-2xl data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:top-2 data-[vaul-drawer-direction=left]:bottom-2 data-[vaul-drawer-direction=left]:left-2 data-[vaul-drawer-direction=left]:h-[calc(100vh-1rem)] data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border data-[vaul-drawer-direction=left]:rounded-2xl data-[vaul-drawer-direction=left]:shadow-2xl data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        {showSwipeHandle && (
          <>
            <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
            <div className="bg-muted/80 pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 hidden h-16 w-1.5 shrink-0 rounded-full group-data-[vaul-drawer-direction=right]/drawer-content:block" />
            <div className="bg-muted/80 pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 hidden h-16 w-1.5 shrink-0 rounded-full group-data-[vaul-drawer-direction=left]/drawer-content:block" />
          </>
        )}
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

const drawerHeaderVariants = cva(
  "flex flex-col gap-0.5 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
  {
    variants: {
      variant: {
        default: "",
        left: "text-left",
      },
      size: {
        default: "p-4",
        lg: "px-6 pt-6 pb-2",
        compact: "px-4 pt-4 pb-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function DrawerHeader({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof drawerHeaderVariants>) {
  return (
    <div
      data-slot="drawer-header"
      data-variant={variant}
      data-size={size}
      className={cn(drawerHeaderVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const drawerFooterVariants = cva("mt-auto flex flex-col gap-2", {
  variants: {
    variant: {
      default: "",
      bordered: "border-t",
    },
    size: {
      default: "p-4",
      lg: "px-6 pt-4 pb-6",
      compact: "p-3",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function DrawerFooter({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof drawerFooterVariants>) {
  return (
    <div
      data-slot="drawer-footer"
      data-variant={variant}
      data-size={size}
      className={cn(drawerFooterVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const drawerTitleVariants = cva("text-foreground font-semibold", {
  variants: {
    size: {
      default: "text-lg",
      sm: "text-base tracking-tight",
      xl: "text-xl",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function DrawerTitle({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title> &
  VariantProps<typeof drawerTitleVariants>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      data-size={size}
      className={cn(drawerTitleVariants({ size }), className)}
      {...props}
    />
  )
}

const drawerDescriptionVariants = cva("text-muted-foreground", {
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

function DrawerDescription({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description> &
  VariantProps<typeof drawerDescriptionVariants>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      data-size={size}
      className={cn(drawerDescriptionVariants({ size }), className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
  DrawerNestedRoot,
}
