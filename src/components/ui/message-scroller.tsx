import { ArrowDown01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  MessageScroller as MessageScrollerPrimitive,
} from "@shadcn/react/message-scroller";
import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function MessageScrollerProvider(
  props: React.ComponentProps<typeof MessageScrollerPrimitive.Provider>
) {
  return <MessageScrollerPrimitive.Provider {...props} />;
}

const messageScrollerVariants = cva(
  "group/message-scroller relative flex size-full min-h-0 flex-col overflow-hidden",
  {
    variants: {
      variant: {
        default: "",
        chat: "overview-chat-thread",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function MessageScroller({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Root> &
  VariantProps<typeof messageScrollerVariants>) {
  return (
    <MessageScrollerPrimitive.Root
      className={cn(messageScrollerVariants({ variant }), className)}
      data-slot="message-scroller"
      {...props}
    />
  );
}

const messageScrollerViewportVariants = cva(
  "scroll-fade-b size-full min-h-0 min-w-0 overflow-y-auto overscroll-contain contain-content",
  {
    variants: {
      variant: {
        default: "",
        chat: "overview-chat-viewport",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function MessageScrollerViewport({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Viewport> &
  VariantProps<typeof messageScrollerViewportVariants>) {
  return (
    <MessageScrollerPrimitive.Viewport
      className={cn(messageScrollerViewportVariants({ variant }), className)}
      data-slot="message-scroller-viewport"
      {...props}
    />
  );
}

const messageScrollerContentVariants = cva(
  "flex h-max min-h-full flex-col gap-6",
  {
    variants: {
      variant: {
        default: "",
        chat: "overview-chat-thread-content",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function MessageScrollerContent({
  className,
  variant,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Content> &
  VariantProps<typeof messageScrollerContentVariants>) {
  return (
    <MessageScrollerPrimitive.Content
      className={cn(messageScrollerContentVariants({ variant }), className)}
      data-slot="message-scroller-content"
      {...props}
    />
  );
}

function MessageScrollerItem({
  className,
  scrollAnchor = false,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Item>) {
  return (
    <MessageScrollerPrimitive.Item
      className={cn(
        "min-w-0 shrink-0 [contain-intrinsic-size:auto_10rem] [content-visibility:auto]",
        className
      )}
      data-slot="message-scroller-item"
      scrollAnchor={scrollAnchor}
      {...props}
    />
  );
}

const messageScrollerButtonVariants = cva(
  "absolute inset-s-1/2 bottom-4 -translate-x-1/2 transition-[translate,scale,opacity] duration-200 ease-[var(--ease-out)] data-[active=false]:pointer-events-none data-[active=false]:translate-y-full data-[active=false]:scale-95 data-[active=false]:opacity-0 data-[active=true]:translate-y-0 data-[active=true]:scale-100 data-[active=true]:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:duration-150 rtl:translate-x-1/2",
  {
    variants: {
      variant: {
        default: "",
        chat: "overview-chat-scroll-latest",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function MessageScrollerButton({
  className,
  children,
  variant,
  ...props
}: React.ComponentProps<typeof MessageScrollerPrimitive.Button> &
  VariantProps<typeof messageScrollerButtonVariants>) {
  return (
    <MessageScrollerPrimitive.Button
      className={cn(messageScrollerButtonVariants({ variant }), className)}
      data-slot="message-scroller-button"
      direction="end"
      render={<Button size="icon-sm" variant="secondary" />}
      {...props}
    >
      {children ?? (
        <HugeiconsIcon aria-hidden="true" icon={ArrowDown01Icon} strokeWidth={2} />
      )}
    </MessageScrollerPrimitive.Button>
  );
}

export {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
  messageScrollerVariants,
  messageScrollerViewportVariants,
  messageScrollerContentVariants,
  messageScrollerButtonVariants,
};
