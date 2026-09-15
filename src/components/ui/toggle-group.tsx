import * as React from "react"
import { Toggle as TogglePrimitive } from "@base-ui/react/toggle"
import { ToggleGroup as ToggleGroupPrimitive } from "@base-ui/react/toggle-group"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { toggleVariants } from "@/components/ui/toggle"

const ToggleGroupContext = React.createContext<
  VariantProps<typeof toggleVariants> & {
    spacing?: number
  }
>({
  size: "default",
  variant: "default",
  spacing: 0,
})

const toggleGroupVariants = cva(
  "group/toggle-group flex w-fit items-center gap-[--spacing(var(--gap))]",
  {
    variants: {
      variant: {
        default: "rounded-md data-[spacing=default]:data-[variant=outline]:shadow-xs",
        outline: "rounded-md border border-input shadow-xs",
        subtle: "rounded-xl border border-border/80 bg-muted/40 p-1",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function ToggleGroup({
  className,
  variant = "default",
  size,
  spacing = 0,
  children,
  ...props
}: ToggleGroupPrimitive.Props &
  VariantProps<typeof toggleGroupVariants> &
  Omit<VariantProps<typeof toggleVariants>, "variant"> & {
    spacing?: number
  }) {
  const itemVariant =
    variant === "subtle"
      ? "tab"
      : variant === "outline"
        ? "outline"
        : "default"

  return (
    <ToggleGroupPrimitive
      data-slot="toggle-group"
      data-variant={variant}
      data-size={size}
      data-spacing={spacing}
      style={{ "--gap": spacing } as React.CSSProperties}
      className={cn(toggleGroupVariants({ variant }), className)}
      {...props}
    >
      <ToggleGroupContext.Provider
        value={{ variant: itemVariant, size, spacing }}
      >
        {children}
      </ToggleGroupContext.Provider>
    </ToggleGroupPrimitive>
  )
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  ...props
}: TogglePrimitive.Props & VariantProps<typeof toggleVariants>) {
  const context = React.useContext(ToggleGroupContext)

  return (
    <TogglePrimitive
      data-slot="toggle-group-item"
      data-variant={context.variant || variant}
      data-size={context.size || size}
      data-spacing={context.spacing}
      className={cn(
        toggleVariants({
          variant: context.variant || variant,
          size: context.size || size,
        }),
        "w-auto min-w-0 shrink-0 px-3 focus:z-10 focus-visible:z-10",
        "data-[spacing=0]:rounded-none data-[spacing=0]:shadow-none data-[spacing=0]:first:rounded-l-md data-[spacing=0]:last:rounded-r-md data-[spacing=0]:data-[variant=outline]:border-l-0 data-[spacing=0]:data-[variant=outline]:first:border-l",
        className
      )}
      {...props}
    >
      {children}
    </TogglePrimitive>
  )
}

export { ToggleGroup, ToggleGroupItem, toggleGroupVariants }
