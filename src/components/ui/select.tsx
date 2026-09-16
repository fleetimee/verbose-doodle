import * as React from "react"
import { Select as SelectPrimitive } from "@base-ui/react/select"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { HugeiconsIcon } from "@hugeicons/react";
import { Tick02Icon, ArrowDown01Icon, ArrowUp01Icon } from "@hugeicons/core-free-icons";

type SelectProps = Omit<
  React.ComponentProps<typeof SelectPrimitive.Root>,
  "defaultValue" | "onValueChange" | "value"
> & {
  defaultValue?: string | null
  onValueChange?: (
    value: string,
    eventDetails: SelectPrimitive.Root.ChangeEventDetails
  ) => void
  value?: string | null
}

function Select({ onValueChange, ...props }: SelectProps) {
  return (
    <SelectPrimitive.Root
      onValueChange={
        onValueChange
          ? (value, eventDetails) =>
              onValueChange(String(value ?? ""), eventDetails)
          : undefined
      }
      {...props}
    />
  )
}

function SelectGroup({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Group>) {
  return <SelectPrimitive.Group data-slot="select-group" {...props} />
}

function SelectValue({
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Value>) {
  return <SelectPrimitive.Value data-slot="select-value" {...props} />
}

const selectTriggerVariants = cva(
  "border-input data-[placeholder]:text-muted-foreground [&_svg:not([class*='text-'])]:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 dark:hover:bg-input/50 flex w-fit items-center justify-between gap-2 rounded-md border bg-transparent px-3 py-2 text-sm whitespace-nowrap shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50 *:data-[slot=select-value]:line-clamp-1 *:data-[slot=select-value]:flex *:data-[slot=select-value]:items-center *:data-[slot=select-value]:gap-2 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "",
        method:
          "gap-1 rounded-xl border-2 border-b-[3px] font-black font-mono shadow-none focus:ring-0 focus-visible:ring-0",
        "method-get":
          "gap-1 rounded-xl border-2 border-b-[3px] font-black font-mono shadow-none focus:ring-0 focus-visible:ring-0 border-sky-500/40 border-b-sky-500/80 bg-sky-500/15 text-sky-600 dark:border-sky-500/50 dark:border-b-sky-400 dark:bg-sky-950/60 dark:text-sky-300",
        "method-post":
          "gap-1 rounded-xl border-2 border-b-[3px] font-black font-mono shadow-none focus:ring-0 focus-visible:ring-0 border-emerald-500/40 border-b-emerald-500/80 bg-emerald-500/15 text-emerald-600 dark:border-emerald-500/50 dark:border-b-emerald-400 dark:bg-emerald-950/60 dark:text-emerald-300",
        "method-put":
          "gap-1 rounded-xl border-2 border-b-[3px] font-black font-mono shadow-none focus:ring-0 focus-visible:ring-0 border-amber-500/40 border-b-amber-500/80 bg-amber-500/15 text-amber-600 dark:border-amber-500/50 dark:border-b-amber-400 dark:bg-amber-950/60 dark:text-amber-300",
        "method-delete":
          "gap-1 rounded-xl border-2 border-b-[3px] font-black font-mono shadow-none focus:ring-0 focus-visible:ring-0 border-rose-500/40 border-b-rose-500/80 bg-rose-500/15 text-rose-600 dark:border-rose-500/50 dark:border-b-rose-400 dark:bg-rose-950/60 dark:text-rose-300",
        "method-patch":
          "gap-1 rounded-xl border-2 border-b-[3px] font-black font-mono shadow-none focus:ring-0 focus-visible:ring-0 border-purple-500/40 border-b-purple-500/80 bg-purple-500/15 text-purple-600 dark:border-purple-500/50 dark:border-b-purple-400 dark:bg-purple-950/60 dark:text-purple-300",
        mono: "font-mono text-sm shadow-none",
        subtle: "border-transparent shadow-none",
        "subtle-active": "border-transparent bg-background shadow-xs",
        ghost: "border-none text-muted-foreground text-xs shadow-none",
      },
      size: {
        default: "data-[size=default]:h-9",
        sm: "data-[size=sm]:h-8",
        md: "data-[size=md]:h-11",
        lg: "data-[size=lg]:h-14",
        badge: "h-auto px-2.5 py-0.5 text-xs",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SelectTrigger({
  className,
  variant = "default",
  size = "default",
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Trigger> &
  VariantProps<typeof selectTriggerVariants>) {
  return (
    <SelectPrimitive.Trigger
      data-slot="select-trigger"
      data-variant={variant}
      data-size={size}
      className={cn(selectTriggerVariants({ variant, size }), className)}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon
        render={<HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4 opacity-50" />}
      />
    </SelectPrimitive.Trigger>
  )
}

function SelectContent({
  className,
  children,
  alignItemWithTrigger = false,
  align = "center",
  alignOffset = 0,
  side = "bottom",
  sideOffset = 4,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Popup> &
  Pick<
    SelectPrimitive.Positioner.Props,
    "align" | "alignItemWithTrigger" | "alignOffset" | "side" | "sideOffset"
  >) {
  return (
    <SelectPrimitive.Portal>
      <SelectPrimitive.Positioner
        align={align}
        alignItemWithTrigger={alignItemWithTrigger}
        alignOffset={alignOffset}
        className="isolate z-50 outline-none"
        side={side}
        sideOffset={sideOffset}
      >
        <SelectPrimitive.Popup
          data-slot="select-content"
          className={cn(
            "pointer-events-auto relative z-50 max-h-(--available-height) min-w-[8rem] origin-(--transform-origin) overflow-x-hidden overflow-y-auto rounded-md border bg-popover text-popover-foreground shadow-md transition-[opacity,transform] data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0",
            !alignItemWithTrigger &&
              "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1",
            className
          )}
          {...props}
        >
          <SelectScrollUpButton />
          <SelectPrimitive.List className="p-1">{children}</SelectPrimitive.List>
          <SelectScrollDownButton />
        </SelectPrimitive.Popup>
      </SelectPrimitive.Positioner>
    </SelectPrimitive.Portal>
  )
}

function SelectLabel({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.GroupLabel>) {
  return (
    <SelectPrimitive.GroupLabel
      data-slot="select-label"
      className={cn("text-muted-foreground px-2 py-1.5 text-xs", className)}
      {...props}
    />
  )
}

function SelectItem({
  className,
  children,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Item>) {
  return (
    <SelectPrimitive.Item
      data-slot="select-item"
      className={cn(
        "focus:bg-accent focus:text-accent-foreground [&_svg:not([class*='text-'])]:text-muted-foreground relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50 data-highlighted:bg-accent data-highlighted:text-accent-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2",
        className
      )}
      {...props}
    >
      <span className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <HugeiconsIcon icon={Tick02Icon} strokeWidth={2} className="size-4" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
    </SelectPrimitive.Item>
  )
}

function SelectSeparator({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      data-slot="select-separator"
      className={cn("bg-border pointer-events-none -mx-1 my-1 h-px", className)}
      {...props}
    />
  )
}

function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpArrow>) {
  return (
    <SelectPrimitive.ScrollUpArrow
      data-slot="select-scroll-up-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowUp01Icon} strokeWidth={2} className="size-4" />
    </SelectPrimitive.ScrollUpArrow>
  )
}

function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownArrow>) {
  return (
    <SelectPrimitive.ScrollDownArrow
      data-slot="select-scroll-down-button"
      className={cn(
        "flex cursor-default items-center justify-center py-1",
        className
      )}
      {...props}
    >
      <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={2} className="size-4" />
    </SelectPrimitive.ScrollDownArrow>
  )
}

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
  selectTriggerVariants,
}
