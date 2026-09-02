import type * as React from "react";
import { createContext, useContext, useState } from "react";
import {
  useMessageScroller,
  useMessageScrollerVisibility,
} from "@shadcn/react/message-scroller";

import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { cn } from "@/lib/utils";

type ChatMinimapItem = {
  id: string;
  title: string;
  description: string;
};

type ChatMinimapSide = "left" | "right";

const reducedMotionQuery = "(prefers-reduced-motion: reduce)";
const ChatMinimapSideContext = createContext<ChatMinimapSide | null>(null);

type ChatMinimapContainerProps = React.ComponentProps<"div"> & {
  side?: ChatMinimapSide;
};

function ChatMinimapContainer({
  side = "left",
  className,
  ...props
}: ChatMinimapContainerProps) {
  return (
    <ChatMinimapSideContext.Provider value={side}>
      <div
        className={cn(
          "relative flex min-h-0 *:data-[slot=message-scroller]:min-w-0 *:data-[slot=message-scroller]:flex-1 *:data-[slot=chat-minimap]:absolute *:data-[slot=chat-minimap]:top-1/2 *:data-[slot=chat-minimap]:z-10 *:data-[slot=chat-minimap]:-translate-y-1/2",
          side === "right"
            ? "*:data-[slot=chat-minimap]:right-5 sm:**:data-[slot=message-scroller-content]:pe-20"
            : "*:data-[slot=chat-minimap]:left-3.5 sm:**:data-[slot=message-scroller-content]:ps-20",
          className
        )}
        data-side={side}
        data-slot="chat-minimap-container"
        {...props}
      />
    </ChatMinimapSideContext.Provider>
  );
}

type ChatMinimapProps = React.ComponentProps<"nav"> & {
  items: readonly ChatMinimapItem[];
  side?: ChatMinimapSide;
  magnification?: number;
  lensRange?: number;
  itemSize?: number;
  gap?: number;
  pillWidth?: number;
  transitionDuration?: number;
  easing?: React.CSSProperties["transitionTimingFunction"];
};

function ChatMinimap({
  items,
  side: sideProp,
  magnification = 3,
  lensRange = 3,
  itemSize = 12,
  gap = 0,
  pillWidth = 2,
  transitionDuration = 200,
  easing = "ease-out",
  className,
  style,
  ...props
}: ChatMinimapProps) {
  const containerSide = useContext(ChatMinimapSideContext);
  const side = sideProp ?? containerSide ?? "left";
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const { scrollToMessage } = useMessageScroller();
  const { currentAnchorId } = useMessageScrollerVisibility();

  function selectItem(id: string) {
    scrollToMessage(id, {
      align: "nearest",
      behavior: window.matchMedia(reducedMotionQuery).matches
        ? "instant"
        : "smooth",
    });
  }

  return (
    <nav
      aria-label="Chat minimap"
      className={cn("flex flex-col items-start", className)}
      data-side={side}
      data-slot="chat-minimap"
      style={{ gap, ...style }}
      {...props}
    >
      {items.map((item, index) => {
        const isCurrent = item.id === currentAnchorId;

        return (
          <HoverCard key={item.id}>
            <HoverCardTrigger
              closeDelay={100}
              delay={100}
              render={
                <button
                  aria-current={isCurrent ? "location" : undefined}
                  aria-label={`Jump to: ${item.title}`}
                  className={cn(
                    "group flex items-center rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    side === "right" && "justify-end"
                  )}
                  onBlur={() => setHoveredIndex(null)}
                  onClick={() => selectItem(item.id)}
                  onFocus={() => setHoveredIndex(index)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={{
                    height: itemSize,
                    width: itemSize * magnification,
                  }}
                  type="button"
                />
              }
            >
              <span
                className="rounded-full bg-muted-foreground/40 transition-[width,background-color] group-hover:bg-muted-foreground group-focus-visible:bg-muted-foreground data-[current=true]:bg-foreground"
                data-current={isCurrent}
                style={{
                  width: getMarkerWidth(
                    index,
                    hoveredIndex,
                    itemSize,
                    itemSize * magnification,
                    lensRange
                  ),
                  height: pillWidth,
                  transitionDuration: `${transitionDuration}ms`,
                  transitionTimingFunction: easing,
                }}
              />
            </HoverCardTrigger>
            <HoverCardContent
              className="flex w-72 flex-col gap-1"
              side={side === "right" ? "left" : "right"}
              sideOffset={8}
            >
              <p className="line-clamp-1 text-base font-medium">
                {item.title}
              </p>
              <p className="line-clamp-4 text-sm font-light text-muted-foreground">
                {item.description}
              </p>
            </HoverCardContent>
          </HoverCard>
        );
      })}
    </nav>
  );
}

function getMarkerWidth(
  index: number,
  hoveredIndex: number | null,
  minWidth: number,
  maxWidth: number,
  range: number
) {
  if (hoveredIndex === null) {
    return minWidth;
  }

  const distance = Math.abs(index - hoveredIndex);
  if (distance >= range) {
    return minWidth;
  }

  const factor = (1 + Math.cos((Math.PI * distance) / range)) / 2;
  return minWidth + (maxWidth - minWidth) * factor;
}

export {
  ChatMinimap,
  ChatMinimapContainer,
  type ChatMinimapContainerProps,
  type ChatMinimapItem,
  type ChatMinimapProps,
  type ChatMinimapSide,
};
