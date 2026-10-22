import { useCallback, useEffect, useRef, useState } from "react";
import { fetchLogPage } from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import type { LogPage } from "@/features/log-viewer/types";

const MAX_PAGES = 32;

function mergePage(
  pages: LogPage[],
  page: LogPage,
  direction: "latest" | "older" | "forward"
): LogPage[] {
  if (direction === "latest" || page.reset || pages.length === 0) {
    return [page];
  }
  if (direction === "older") {
    return [page, ...pages].slice(0, MAX_PAGES);
  }
  if (page.segments.length > 0) {
    return [...pages, page].slice(-MAX_PAGES);
  }
  return pages.map((previous, index) =>
    index === pages.length - 1
      ? { ...previous, nextCursor: page.nextCursor, hasMore: page.hasMore }
      : previous
  );
}

export function useLogStream(
  id: string,
  stream: string,
  from: string,
  to: string,
  follow: boolean
) {
  const [pages, setPages] = useState<LogPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reset, setReset] = useState(false);
  const [failedDirection, setFailedDirection] = useState<
    "latest" | "older" | "forward"
  >("latest");
  const current = useRef<LogPage[]>([]);
  const request = useRef<AbortController | null>(null);

  const load = useCallback(
    async (direction: "latest" | "older" | "forward") => {
      if (request.current) {
        return false;
      }
      const controller = new AbortController();
      request.current = controller;
      setLoading(true);
      try {
        const first = current.current[0];
        const last = current.current.at(-1);
        let cursor: string | null | undefined;
        if (direction === "older") {
          cursor = first?.olderCursor;
        }
        if (direction === "forward") {
          cursor = last?.nextCursor;
        }
        const page = await fetchLogPage({
          id,
          stream,
          from,
          to,
          direction,
          cursor,
          signal: controller.signal,
        });
        if (controller.signal.aborted) {
          return false;
        }
        const next = mergePage(current.current, page, direction);
        current.current = next;
        setPages(next);
        setError(null);
        setReset(page.reset);
        return true;
      } catch (cause) {
        if (!controller.signal.aborted) {
          setError(getErrorMessage(cause));
          setFailedDirection(direction);
        }
        return false;
      } finally {
        if (request.current === controller) {
          request.current = null;
          setLoading(false);
        }
      }
    },
    [id, stream, from, to]
  );

  useEffect(() => {
    load("latest");
    return () => {
      request.current?.abort();
      request.current = null;
    };
  }, [load]);

  useEffect(() => {
    if (!follow) {
      return;
    }
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        load("forward");
      }
    }, 3000);
    return () => window.clearInterval(timer);
  }, [follow, load]);

  return { pages, loading, error, reset, failedDirection, load };
}
