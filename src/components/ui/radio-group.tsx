"use client"

import * as React from "react"
import { Radio as RadioPrimitive } from "@base-ui/react/radio"
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group"
import { CircleIcon } from "@/components/hugeicons"

import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const radioGroupVariants = cva("grid", {
  variants: {
    size: {
      default: "gap-3",
      lg: "gap-4",
      sm: "gap-2",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function RadioGroup({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof RadioGroupPrimitive> &
  VariantProps<typeof radioGroupVariants>) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-size={size}
      className={cn(radioGroupVariants({ size }), className)}
      {...props}
    />
  )
}

function RadioGroupItem({
  className,
  ...props
}: React.ComponentProps<typeof RadioPrimitive.Root>) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      className={cn(
        "border-input text-primary focus-visible:border-ring focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive dark:bg-input/30 aspect-square size-4 shrink-0 rounded-full border shadow-xs transition-[color,box-shadow] outline-none focus-visible:ring-[3px] data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="relative flex items-center justify-center"
      >
        <CircleIcon className="fill-primary absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  )
}

export { RadioGroup, RadioGroupItem }
