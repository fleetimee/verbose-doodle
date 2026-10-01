"use client"

import * as React from "react"
import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"
import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { messages } from "@/lib/i18n"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { HugeiconsIcon } from "@hugeicons/react";
import { SidebarLeftIcon } from "@hugeicons/core-free-icons";

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "17.5rem"
const SIDEBAR_WIDTH_MOBILE = "18rem"
const SIDEBAR_WIDTH_ICON = "3rem"
const SIDEBAR_WIDTH_MIN = 12
const SIDEBAR_WIDTH_MAX = 28
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContextProps = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  sidebarWidth: string
  setSidebarWidth: (width: string) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContextProps | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const sidebarProviderVariants = cva(
  "group/sidebar-wrapper has-data-[variant=inset]:bg-sidebar flex min-h-svh w-full",
  {
    variants: {
      variant: {
        default: "",
        fixed: "h-dvh min-h-0 overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function isFunction<T>(value: T | ((prev: T) => T)): value is (prev: T) => T {
  return typeof value === "function";
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function SidebarProvider({
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
  className,
  style,
  children,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof sidebarProviderVariants> & {
    defaultOpen?: boolean
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }) {
  const isMobile = useIsMobile()
  const [openMobile, setOpenMobile] = React.useState(false)
  const [sidebarWidth, setSidebarWidth] = React.useState(SIDEBAR_WIDTH)

  // This is the internal state of the sidebar.
  // We use openProp and setOpenProp for control from outside the component.
  const [_open, _setOpen] = React.useState(defaultOpen)
  const open = openProp ?? _open
  const setOpen = React.useCallback(
    (value: boolean | ((value: boolean) => boolean)) => {
      const openState = isFunction(value) ? value(open) : value
      if (setOpenProp) {
        setOpenProp(openState)
      } else {
        _setOpen(openState)
      }

      // This sets the cookie to keep the sidebar state.
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
    },
    [setOpenProp, open]
  )

  // Helper to toggle the sidebar.
  const toggleSidebar = React.useCallback(() => isMobile ? setOpenMobile((open) => !open) : setOpen((open) => !open), [isMobile, setOpen, setOpenMobile])

  // Adds a keyboard shortcut to toggle the sidebar.
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
        (event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        toggleSidebar()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleSidebar])

  // We add a state so that we can do data-state="expanded" or "collapsed".
  // This makes it easier to style the sidebar with Tailwind classes.
  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContextProps>(
    () => ({
      state,
      open,
      setOpen,
      sidebarWidth,
      setSidebarWidth,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [
      state,
      open,
      setOpen,
      sidebarWidth,
      setSidebarWidth,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    ]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <TooltipProvider delayDuration={0}>
        <div
          data-slot="sidebar-wrapper"
          data-variant={variant}
          style={
            /* SAFETY: Custom CSS variables for sidebar styling */
            {
              "--sidebar-width": sidebarWidth,
              "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
              ...style,
            } as React.CSSProperties
          }
          className={cn(sidebarProviderVariants({ variant }), className)}
          {...props}
        >
          {children}
        </div>
      </TooltipProvider>
    </SidebarContext.Provider>
  )
}

function Sidebar({
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  className,
  children,
  dir,
  ...props
}: React.ComponentProps<"div"> & {
  side?: "left" | "right"
  variant?: "sidebar" | "floating" | "inset"
  collapsible?: "offcanvas" | "icon" | "none"
}) {
  const { isMobile, state, openMobile, setOpenMobile } = useSidebar()

  if (collapsible === "none") {
    return (
      <div
        data-slot="sidebar"
        className={cn(
          "bg-sidebar text-sidebar-foreground flex h-full w-(--sidebar-width) flex-col",
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
        <SheetContent
          dir={dir}
          data-sidebar="sidebar"
          data-slot="sidebar"
          data-mobile="true"
          className="bg-sidebar text-sidebar-foreground w-(--sidebar-width) p-0 [&>button]:hidden"
          style={
            /* SAFETY: The object contains only CSS custom properties consumed by the mobile sidebar. */
            {
              "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            } as React.CSSProperties
          }
          side={side}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{messages.common.sidebar}</SheetTitle>
            <SheetDescription>
              {messages.common.mobileSidebarDescription}
            </SheetDescription>
          </SheetHeader>
          <div className="flex h-full w-full flex-col">{children}</div>
        </SheetContent>
      </Sheet>
    )
  }

  return (
    <div
      className="group peer text-sidebar-foreground hidden md:block"
      data-state={state}
      data-collapsible={state === "collapsed" ? collapsible : ""}
      data-variant={variant}
      data-side={side}
      data-slot="sidebar"
    >
      {/* This is what handles the sidebar gap on desktop */}
      <div
        data-slot="sidebar-gap"
        className={cn(
          "relative w-(--sidebar-width) bg-transparent transition-[width] duration-200 ease-linear",
          "group-data-[collapsible=offcanvas]:w-0",
          "group-data-[side=right]:rotate-180",
          variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4)))]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon)"
        )}
      />
      <div
        data-slot="sidebar-container"
        data-side={side}
        className={cn(
          "fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[left,right,width] duration-200 ease-linear md:flex data-[side=left]:left-0 data-[side=right]:right-0 data-[side=left]:group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)] data-[side=right]:group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]",
          // Adjust the padding for floating and inset variants.
          variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)+(--spacing(4))+2px)]"
            : "group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l",
          className
        )}
        {...props}
      >
        <div
          data-sidebar="sidebar"
          data-slot="sidebar-inner"
          className="bg-sidebar group-data-[variant=floating]:border-sidebar-border flex h-full w-full flex-col group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:shadow-sm"
        >
          {children}
        </div>
      </div>
    </div>
  )
}

function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { toggleSidebar } = useSidebar()

  return (
    <Button
      data-sidebar="trigger"
      data-slot="sidebar-trigger"
      variant="ghost"
      size="icon"
      className={cn("size-7", className)}
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={2} className="rtl:rotate-180" />
      <span className="sr-only">{messages.common.toggleSidebar}</span>
    </Button>
  )
}

function SidebarRail({
  className,
  onClick,
  onPointerDown,
  title = messages.common.resizeOrToggleSidebar,
  ...props
}: React.ComponentProps<"button">) {
  const { open, setOpen, setSidebarWidth, sidebarWidth, toggleSidebar } =
    useSidebar()
  const didDragRef = React.useRef(false)

  const getSidebarWidthInPixels = (width: string, rootFontSize: number) => {
    const numericWidth = Number.parseFloat(width)

    if (Number.isNaN(numericWidth)) {
      return 16 * rootFontSize
    }

    return width.endsWith("rem") ? numericWidth * rootFontSize : numericWidth
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event)

    if (event.defaultPrevented) {
      return
    }

    if (event.button !== 0) {
      return
    }

    event.preventDefault()
    try {
      event.currentTarget.setPointerCapture(event.pointerId)
    } catch {
      // Synthetic pointer events do not always have an active pointer.
    }

    const rootFontSize = Number.parseFloat(
      window.getComputedStyle(document.documentElement).fontSize
    )
    const minWidth = SIDEBAR_WIDTH_MIN * rootFontSize
    const maxWidth = SIDEBAR_WIDTH_MAX * rootFontSize
    const initialWidth = getSidebarWidthInPixels(sidebarWidth, rootFontSize)
    const startX = event.clientX
    const isRightSide =
      event.currentTarget.closest("[data-side=right]") !== null

    didDragRef.current = false

    const handlePointerMove = (pointerEvent: PointerEvent) => {
      const delta = isRightSide
        ? startX - pointerEvent.clientX
        : pointerEvent.clientX - startX

      if (Math.abs(delta) > 2) {
        didDragRef.current = true
      }

      if (!open) {
        setOpen(true)
      }

      if (initialWidth + delta <= minWidth) {
        setOpen(false)
        setSidebarWidth(`${Math.round(minWidth)}px`)
        return
      }

      const nextWidth = Math.min(
        Math.max(initialWidth + delta, minWidth),
        maxWidth
      )

      setSidebarWidth(`${Math.round(nextWidth)}px`)
    }

    const handlePointerUp = () => {
      window.removeEventListener("pointermove", handlePointerMove)
      window.removeEventListener("pointerup", handlePointerUp)
    }

    window.addEventListener("pointermove", handlePointerMove)
    window.addEventListener("pointerup", handlePointerUp, { once: true })
  }

  return (
    <button
      data-sidebar="rail"
      data-slot="sidebar-rail"
      aria-label={messages.common.toggleSidebar}
      tabIndex={-1}
      onClick={(event) => {
        onClick?.(event)

        if (event.defaultPrevented) {
          return
        }

        if (didDragRef.current) {
          event.preventDefault()
          didDragRef.current = false
          return
        }

        toggleSidebar()
      }}
      onPointerDown={handlePointerDown}
      title={title}
      className={cn(
        "hover:after:bg-sidebar-border absolute inset-y-0 z-20 hidden w-4 ltr:-translate-x-1/2 rtl:-translate-x-1/2 transition-all ease-linear group-data-[side=left]:-right-4 group-data-[side=right]:left-0 after:absolute after:inset-y-0 after:start-1/2 after:w-[2px] sm:flex",
        "in-data-[side=left]:cursor-w-resize in-data-[side=right]:cursor-e-resize",
        "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize",
        "hover:group-data-[collapsible=offcanvas]:bg-sidebar group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full",
        "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2",
        "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2",
        className
      )}
      {...props}
    />
  )
}

const sidebarInsetVariants = cva(
  "bg-background relative flex w-full flex-1 flex-col md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-2",
  {
    variants: {
      variant: {
        default: "",
        card: "h-full min-h-0 overflow-hidden bg-card",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function SidebarInset({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"main"> & VariantProps<typeof sidebarInsetVariants>) {
  return (
    <main
      data-slot="sidebar-inset"
      data-variant={variant}
      className={cn(sidebarInsetVariants({ variant }), className)}
      {...props}
    />
  )
}

function SidebarInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  return (
    <Input
      data-slot="sidebar-input"
      data-sidebar="input"
      className={cn("bg-background h-8 w-full shadow-none", className)}
      {...props}
    />
  )
}

const sidebarHeaderVariants = cva("flex flex-col gap-2 p-2", {
  variants: {
    variant: {
      default: "",
      compact:
        "p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SidebarHeader({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof sidebarHeaderVariants>) {
  return (
    <div
      data-slot="sidebar-header"
      data-sidebar="header"
      data-variant={variant}
      className={cn(sidebarHeaderVariants({ variant }), className)}
      {...props}
    />
  )
}

const sidebarFooterVariants = cva("flex flex-col gap-2 p-2", {
  variants: {
    variant: {
      default: "",
      compact:
        "p-3 group-data-[collapsible=icon]:items-center group-data-[collapsible=icon]:p-2",
    },
  },
  defaultVariants: {
    variant: "default",
  },
})

function SidebarFooter({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof sidebarFooterVariants>) {
  return (
    <div
      data-slot="sidebar-footer"
      data-sidebar="footer"
      data-variant={variant}
      className={cn(sidebarFooterVariants({ variant }), className)}
      {...props}
    />
  )
}

function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<typeof Separator>) {
  return (
    <Separator
      data-slot="sidebar-separator"
      data-sidebar="separator"
      className={cn(
        "bg-sidebar-border mx-2 data-[orientation=horizontal]:w-auto!",
        className
      )}
      {...props}
    />
  )
}

function SidebarContent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-content"
      data-sidebar="content"
      className={cn(
        "flex min-h-0 flex-1 flex-col overflow-hidden px-1 group-data-[collapsible=icon]:overflow-hidden group-data-[collapsible=icon]:px-0",
        className
      )}
      {...props}
    >
      <ScrollArea className="h-full w-full flex-1 pr-1.5 [&>[data-slot=scroll-area-viewport]]:overflow-x-hidden">
        <div className="flex min-h-full w-full flex-col gap-2 p-0 group-data-[collapsible=icon]:items-center overflow-hidden">
          {children}
        </div>
      </ScrollArea>
    </div>
  )
}

const sidebarGroupVariants = cva("relative flex w-full min-w-0 flex-col", {
  variants: {
    size: {
      default: "p-2",
      none: "p-0",
      sm: "p-1",
    },
  },
  defaultVariants: {
    size: "default",
  },
})

function SidebarGroup({
  className,
  size = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof sidebarGroupVariants>) {
  return (
    <div
      data-slot="sidebar-group"
      data-sidebar="group"
      data-size={size}
      className={cn(sidebarGroupVariants({ size }), className)}
      {...props}
    />
  )
}

function SidebarGroupLabel({
  className,
  render,
  ...props
}: useRender.ComponentProps<"div">) {
  // SAFETY: mergeProps returns the div props contract declared by useRender.
  return useRender({
    defaultTagName: "div",
    render,
    props: mergeProps<"div">(
      {
        "data-slot": "sidebar-group-label",
        "data-sidebar": "group-label",
        className: cn(
          "text-sidebar-foreground/70 ring-sidebar-ring flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium outline-hidden transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0",
          className
        ),
      } as React.ComponentProps<"div">,
      props
    ),
  })
}

function SidebarGroupAction({
  className,
  render,
  ...props
}: useRender.ComponentProps<"button">) {
  // SAFETY: mergeProps returns the button props contract declared by useRender.
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        "data-slot": "sidebar-group-action",
        "data-sidebar": "group-action",
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 md:after:hidden",
          "group-data-[collapsible=icon]:hidden",
          className
        ),
      } as React.ComponentProps<"button">,
      props
    ),
  })
}

function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-group-content"
      data-sidebar="group-content"
      className={cn("w-full text-sm", className)}
      {...props}
    />
  )
}

function SidebarMenu({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu"
      data-sidebar="menu"
      className={cn("flex w-full min-w-0 flex-col gap-1", className)}
      {...props}
    />
  )
}

function SidebarMenuItem({ className, ...props }: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-item"
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      {...props}
    />
  )
}

const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:size-8! group-data-[collapsible=icon]:p-2! [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        outline:
          "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        elevated:
          "rounded-md border border-transparent data-[active=true]:border-sidebar-border data-[active=true]:bg-background data-[active=true]:text-primary data-[active=true]:shadow-xs",
        section:
          "rounded-md data-[active=true]:bg-transparent data-[active=true]:text-primary hover:bg-sidebar-accent/50",
        flyout:
          "relative rounded-lg data-[active=true]:shadow-xs data-popup-open:bg-sidebar-accent",
        brand:
          "h-14 rounded-lg border border-sidebar-border/70 bg-sidebar-accent/45 px-2.5 shadow-xs group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:border-0 group-data-[collapsible=icon]:bg-transparent group-data-[collapsible=icon]:shadow-none",
        secondary:
          "rounded-lg text-sidebar-foreground/75 hover:text-sidebar-foreground",
        account:
          "rounded-lg border border-sidebar-border/70 bg-sidebar-accent/35 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
        search:
          "navigation-search-trigger h-9 rounded-lg border border-sidebar-border bg-sidebar text-muted-foreground",
        destructive:
          "text-destructive hover:text-destructive active:text-destructive hover:bg-destructive/10",
      },
      size: {
        default: "h-8 text-sm",
        sm: "h-7 text-xs",
        md: "h-9 text-sm",
        lg: "h-12 text-sm group-data-[collapsible=icon]:p-0!",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function SidebarMenuButton({
  render,
  isActive = false,
  variant = "default",
  size = "default",
  tooltip,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  render?: useRender.ComponentProps<"button">["render"]
  isActive?: boolean
  tooltip?: string | React.ComponentProps<typeof TooltipContent>
} & VariantProps<typeof sidebarMenuButtonVariants>) {
  const { isMobile, state } = useSidebar()

  // SAFETY: mergeProps returns the button props contract declared by useRender.
  const button = useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        "data-slot": "sidebar-menu-button",
        "data-sidebar": "menu-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(sidebarMenuButtonVariants({ variant, size }), className),
      } as React.ComponentProps<"button">,
      props
    ),
  })

  if (!tooltip) {
    return button
  }

  if (isString(tooltip)) {
    tooltip = {
      children: tooltip,
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent
        side="right"
        align="center"
        hidden={state !== "collapsed" || isMobile}
        {...tooltip}
      />
    </Tooltip>
  )
}

function SidebarMenuAction({
  className,
  render,
  showOnHover = false,
  ...props
}: React.ComponentProps<"button"> & {
  render?: useRender.ComponentProps<"button">["render"]
  showOnHover?: boolean
}) {
  // SAFETY: mergeProps returns the button props contract declared by useRender.
  return useRender({
    defaultTagName: "button",
    render,
    props: mergeProps<"button">(
      {
        "data-slot": "sidebar-menu-action",
        "data-sidebar": "menu-action",
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground peer-hover/menu-button:text-sidebar-accent-foreground absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0 outline-hidden transition-transform focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0",
          // Increases the hit area of the button on mobile.
          "after:absolute after:-inset-2 md:after:hidden",
          "peer-data-[size=sm]/menu-button:top-1",
          "peer-data-[size=default]/menu-button:top-1.5",
          "peer-data-[size=lg]/menu-button:top-2.5",
          "group-data-[collapsible=icon]:hidden",
          showOnHover &&
            "peer-data-[active=true]/menu-button:text-sidebar-accent-foreground group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 md:opacity-0",
          className
        ),
      } as React.ComponentProps<"button">,
      props
    ),
  })
}

const sidebarMenuBadgeVariants = cva(
  "text-sidebar-foreground pointer-events-none absolute right-1 flex h-5 min-w-5 items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums select-none peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground peer-data-[size=sm]/menu-button:top-1 peer-data-[size=default]/menu-button:top-1.5 peer-data-[size=md]/menu-button:top-2 peer-data-[size=lg]/menu-button:top-2.5 group-data-[collapsible=icon]:hidden",
  {
    variants: {
      variant: {
        default: "",
        muted: "text-sidebar-foreground/55",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function SidebarMenuBadge({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof sidebarMenuBadgeVariants>) {
  return (
    <div
      data-slot="sidebar-menu-badge"
      data-sidebar="menu-badge"
      data-variant={variant}
      className={cn(sidebarMenuBadgeVariants({ variant }), className)}
      {...props}
    />
  )
}

function SidebarMenuSkeleton({
  className,
  showIcon = false,
  ...props
}: React.ComponentProps<"div"> & {
  showIcon?: boolean
}) {
  // Random width between 50 to 90%.
  const width = React.useMemo(() => `${Math.floor(Math.random() * 40) + 50}%`, [])

  return (
    <div
      data-slot="sidebar-menu-skeleton"
      data-sidebar="menu-skeleton"
      className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)}
      {...props}
    >
      {showIcon && (
        <Skeleton
          className="size-4 rounded-md"
          data-sidebar="menu-skeleton-icon"
        />
      )}
      <Skeleton
        className="h-4 max-w-(--skeleton-width) flex-1"
        data-sidebar="menu-skeleton-text"
        style={
          /* SAFETY: The object contains only the CSS custom property consumed by the skeleton width. */
          {
            "--skeleton-width": width,
          } as React.CSSProperties
        }
      />
    </div>
  )
}

function SidebarMenuSub({ className, ...props }: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="sidebar-menu-sub"
      data-sidebar="menu-sub"
      className={cn(
        "border-sidebar-border/70 ml-3.5 mt-1 mb-1 flex min-w-0 flex-col gap-1 border-l pl-2.5 pr-0.5 py-0.5",
        "group-data-[collapsible=icon]:hidden",
        className
      )}
      {...props}
    />
  )
}

function SidebarMenuSubItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li
      data-slot="sidebar-menu-sub-item"
      data-sidebar="menu-sub-item"
      className={cn("group/menu-sub-item relative", className)}
      {...props}
    />
  )
}

function SidebarMenuSubButton({
  render,
  size = "md",
  isActive = false,
  className,
  ...props
}: React.ComponentProps<"a"> & {
  render?: useRender.ComponentProps<"a">["render"]
  size?: "sm" | "md"
  isActive?: boolean
}) {
  // SAFETY: mergeProps returns the anchor props contract declared by useRender.
  return useRender({
    defaultTagName: "a",
    render,
    props: mergeProps<"a">(
      {
        "data-slot": "sidebar-menu-sub-button",
        "data-sidebar": "menu-sub-button",
        "data-size": size,
        "data-active": isActive,
        className: cn(
          "text-sidebar-foreground ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground active:bg-sidebar-accent active:text-sidebar-accent-foreground [&>svg]:text-sidebar-accent-foreground flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2 outline-hidden focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0",
          "border border-transparent data-[active=true]:border-sidebar-border data-[active=true]:bg-background data-[active=true]:font-medium data-[active=true]:text-primary data-[active=true]:shadow-xs data-[active=true]:[&>svg]:text-primary",
          size === "sm" && "text-xs",
          size === "md" && "text-sm",
          "group-data-[collapsible=icon]:hidden",
          className
        ),
      } as React.ComponentProps<"a">,
      props
    ),
  })
}

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
}
