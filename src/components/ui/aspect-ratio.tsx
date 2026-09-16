"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

function AspectRatio({
  className,
  ratio = 1,
  style,
  ...props
}: React.ComponentProps<"div"> & {
  ratio?: number
}) {
  return (
    <div
      data-slot="aspect-ratio"
      className={cn("w-full aspect-(--aspect-ratio)", className)}
      // SAFETY: Dynamic aspect ratio applied via CSS custom property
      style={
        {
          "--aspect-ratio": ratio,
          ...style,
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { AspectRatio }
