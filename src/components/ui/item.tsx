import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

function ItemGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      data-slot="item-group"
      className={cn("group/item-group flex flex-col", className)}
      {...props}
    />
  )
}

function ItemSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="item-separator"
      orientation="horizontal"
      className={cn("my-0", className)}
      {...props}
    />
  )
}

const itemVariants = cva(
  "group/item flex items-center border border-transparent text-sm rounded-md transition-colors [a]:hover:bg-accent/50 [a]:transition-colors duration-100 flex-wrap outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border-border",
        muted: "bg-muted/50",
        elevated:
          "rounded-2xl border-2 border-border/80 border-b-4 bg-card/95 shadow-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-border/90 hover:border-b-primary/60 hover:bg-card hover:shadow-md active:translate-y-1 active:border-b-2",
        "elevated-subtle":
          "rounded-2xl border-2 border-border/80 border-b-4 bg-card/85 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-border/90 hover:border-b-primary/60 hover:bg-accent/40 hover:shadow-sm active:translate-y-1 active:border-b-2",
        dashed:
          "rounded-2xl border-2 border-dashed border-border/80 bg-muted/35 shadow-xs transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-border/90 hover:bg-muted/50 hover:shadow-md active:translate-y-1",
        "dashed-subtle":
          "rounded-2xl border-2 border-dashed border-border/80 bg-muted/35 transition-all duration-150 ease-out hover:-translate-y-0.5 hover:border-border/90 hover:bg-muted/50 active:translate-y-1",
      },
      size: {
        default: "p-4 gap-4",
        sm: "py-3 px-4 gap-2.5",
        none: "p-0 gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Item({
  className,
  variant = "default",
  size = "default",
  render,
  ...props
}: useRender.ComponentProps<"div"> & VariantProps<typeof itemVariants>) {
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "item",
        "data-variant": variant,
        "data-size": size,
        className: cn(itemVariants({ variant, size }), className),
      } as React.ComponentProps<"div">,
      props
    ),
  })
}

const itemMediaVariants = cva(
  "flex shrink-0 items-center justify-center gap-2 group-has-[[data-slot=item-description]]/item:self-start [&_svg]:pointer-events-none group-has-[[data-slot=item-description]]/item:translate-y-0.5",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        icon: "size-8 border rounded-sm bg-muted [&_svg:not([class*='size-'])]:size-4",
        image:
          "size-10 rounded-sm overflow-hidden [&_img]:size-full [&_img]:object-cover",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemMedia({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemMediaVariants>) {
  return (
    <div
      data-slot="item-media"
      data-variant={variant}
      className={cn(itemMediaVariants({ variant, className }))}
      {...props}
    />
  )
}

const itemContentVariants = cva(
  "flex flex-1 flex-col gap-1 [&+[data-slot=item-content]]:flex-none",
  {
    variants: {
      variant: {
        default: "",
      },
      size: {
        default: "",
        card: "gap-3 py-4 pr-3 pl-5",
        list: "gap-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function ItemContent({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemContentVariants>) {
  return (
    <div
      data-slot="item-content"
      data-variant={variant}
      data-size={size}
      className={cn(itemContentVariants({ variant, size }), className)}
      {...props}
    />
  )
}

const itemTitleVariants = cva(
  "flex w-fit items-center gap-2 text-sm leading-snug font-medium",
  {
    variants: {
      variant: {
        default: "",
        bold: "font-bold text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ItemTitle({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemTitleVariants>) {
  return (
    <div
      data-slot="item-title"
      data-variant={variant}
      className={cn(itemTitleVariants({ variant }), className)}
      {...props}
    />
  )
}

function ItemDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-description"
      className={cn(
        "text-muted-foreground line-clamp-2 text-sm leading-normal font-normal text-balance",
        "[&>a:hover]:text-primary [&>a]:underline [&>a]:underline-offset-4",
        className
      )}
      {...props}
    />
  )
}

const itemActionsVariants = cva("flex items-center gap-2", {
  variants: {
    variant: {
      default: "",
    },
    size: {
      default: "",
      card: "pr-4",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
  },
})

function ItemActions({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof itemActionsVariants>) {
  return (
    <div
      data-slot="item-actions"
      data-variant={variant}
      data-size={size}
      className={cn(itemActionsVariants({ variant, size }), className)}
      {...props}
    />
  )
}

function ItemHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-header"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

function ItemFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="item-footer"
      className={cn(
        "flex basis-full items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export {
  Item,
  ItemMedia,
  ItemContent,
  ItemActions,
  ItemGroup,
  ItemSeparator,
  ItemTitle,
  ItemDescription,
  ItemHeader,
  ItemFooter,
  itemVariants,
  itemContentVariants,
  itemTitleVariants,
  itemActionsVariants,
}
