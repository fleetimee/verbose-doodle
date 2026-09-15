import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"
import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"

import { cn } from "@/lib/utils"

const tabsVariants = cva("flex flex-col gap-2", {
  variants: {
    variant: {
      default: "",
      flush: "gap-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function Tabs({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Root> & VariantProps<typeof tabsVariants>) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-variant={variant}
      className={cn(tabsVariants({ variant }), className)}
      {...props}
    />
  )
}

const tabsListVariants = cva(
  "bg-muted text-muted-foreground inline-flex h-9 w-fit items-center justify-center rounded-lg p-[3px]",
  {
    variants: {
      variant: {
        default: "",
        subtle: "bg-muted/60 rounded-md p-0.5",
        solid: "bg-muted/80",
        transparent: "bg-transparent p-0 rounded-md",
      },
      size: {
        default: "",
        sm: "h-8 p-0.5 rounded-md",
        xs: "h-7 p-0.5 rounded-md",
        lg: "h-14",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function TabsList({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      data-size={size}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  "data-active:bg-background dark:data-active:text-foreground focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:outline-ring dark:data-active:border-input dark:data-active:bg-input/30 text-foreground dark:text-muted-foreground inline-flex h-[calc(100%-1px)] flex-1 items-center justify-center gap-1.5 rounded-md border border-transparent px-2 py-1 text-sm font-medium whitespace-nowrap transition-[color,box-shadow] focus-visible:ring-[3px] focus-visible:outline-1 disabled:pointer-events-none disabled:opacity-50 aria-disabled:opacity-50 data-active:shadow-sm [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        compact: "data-active:shadow-xs",
        tile: "flex-col gap-0 rounded-md px-3 data-active:bg-background data-active:shadow-xs",
      },
      size: {
        default: "",
        sm: "px-2.5 text-xs",
        xs: "px-2 text-xs",
        md: "px-3 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function TabsTrigger({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Tab> & VariantProps<typeof tabsTriggerVariants>) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      data-variant={variant}
      data-size={size}
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const tabsContentVariants = cva("flex-1 outline-none", {
  variants: {
    variant: {
      default: "",
      flush: "p-0",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function TabsContent({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<typeof TabsPrimitive.Panel> & VariantProps<typeof tabsContentVariants>) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      data-variant={variant}
      className={cn(tabsContentVariants({ variant }), className)}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  tabsVariants,
  tabsListVariants,
  tabsTriggerVariants,
  tabsContentVariants,
}
