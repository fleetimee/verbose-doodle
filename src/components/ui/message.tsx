import { cva, type VariantProps } from "class-variance-authority";
import type * as React from "react";

import { cn } from "@/lib/utils";

const messageVariants = cva(
  "group/message relative flex w-full min-w-0 gap-2 text-sm data-[align=end]:flex-row-reverse",
  {
    variants: {
      variant: {
        default: "",
        chat: "overview-chat-message",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Message({
  className,
  align = "start",
  variant,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof messageVariants> & { align?: "start" | "end" }) {
  return (
    <div
      className={cn(messageVariants({ variant }), className)}
      data-align={align}
      data-slot="message"
      {...props}
    />
  );
}

const messageAvatarVariants = cva(
  "flex w-fit min-w-8 shrink-0 items-center justify-center self-end overflow-hidden rounded-full bg-muted",
  {
    variants: {
      variant: {
        default: "",
        ghost:
          "overview-chat-message-avatar self-start overflow-visible rounded-none bg-transparent",
        chat: "overview-chat-message-avatar self-start overflow-visible rounded-none bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function MessageAvatar({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof messageAvatarVariants>) {
  return (
    <div
      className={cn(messageAvatarVariants({ variant }), className)}
      data-slot="message-avatar"
      {...props}
    />
  );
}

const messageContentVariants = cva(
  "wrap-break-word flex w-full min-w-0 flex-col gap-2.5 group-data-[align=end]/message:*:data-slot:self-end",
  {
    variants: {
      variant: {
        default: "",
        chat: "overview-chat-message-body",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function MessageContent({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof messageContentVariants>) {
  return (
    <div
      className={cn(messageContentVariants({ variant }), className)}
      data-slot="message-content"
      {...props}
    />
  );
}

export {
  Message,
  MessageAvatar,
  MessageContent,
  messageVariants,
  messageAvatarVariants,
  messageContentVariants,
};
