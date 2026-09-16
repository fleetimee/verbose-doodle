import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

function Collapsible({
  ...props
}: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

const collapsibleTriggerVariants = cva("", {
  variants: {
    variant: {
      default: "",
      header:
        "flex w-full items-center justify-between gap-3 border-b pb-3 text-left font-medium text-sm focus-visible:outline-2 focus-visible:outline-ring",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function CollapsibleTrigger({
  className,
  variant,
  ...props
}: CollapsiblePrimitive.Trigger.Props &
  VariantProps<typeof collapsibleTriggerVariants>) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      data-variant={variant}
      className={cn(collapsibleTriggerVariants({ variant }), className)}
      {...props}
    />
  )
}

function CollapsibleContent({
  className,
  children,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "h-(--collapsible-panel-height) overflow-hidden text-sm transition-[height] duration-200 ease-out data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    >
      {children}
    </CollapsiblePrimitive.Panel>
  )
}

export {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
  collapsibleTriggerVariants,
}
