import { type RefObject, useEffect, useLayoutEffect, useRef } from "react";

const BOTTOM_SCROLL_THRESHOLD_PX = 24;

type TrafficLogItem = {
  readonly id: string;
};

function isNearBottom(viewport: HTMLElement) {
  return (
    viewport.scrollHeight - viewport.clientHeight - viewport.scrollTop <=
    BOTTOM_SCROLL_THRESHOLD_PX
  );
}

export function useTrafficLogScroll(
  viewportRef: RefObject<HTMLDivElement | null>,
  logs: readonly TrafficLogItem[],
  autoRefresh: boolean
) {
  const shouldStickToBottomRef = useRef(true);
  const hasRenderedLogsRef = useRef(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) {
      return;
    }

    const handleScroll = () => {
      shouldStickToBottomRef.current = isNearBottom(viewport);
    };

    viewport.addEventListener("scroll", handleScroll);
    return () => viewport.removeEventListener("scroll", handleScroll);
  }, [viewportRef]);

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (logs.length === 0) {
      hasRenderedLogsRef.current = false;
      return;
    }

    if (
      viewport &&
      (!hasRenderedLogsRef.current ||
        autoRefresh ||
        shouldStickToBottomRef.current)
    ) {
      viewport.scrollTop = viewport.scrollHeight;
    }

    hasRenderedLogsRef.current = true;
  }, [autoRefresh, logs, viewportRef]);
}
