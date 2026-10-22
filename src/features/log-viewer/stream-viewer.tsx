import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { FileText, ShieldCheck } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { IsoLogPayload } from "@/features/log-viewer/iso-log-payload";
import { LogToolbar } from "@/features/log-viewer/log-toolbar";
import { useLogSearch } from "@/features/log-viewer/use-log-search";
import { useLogStream } from "@/features/log-viewer/use-log-stream";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";
import { cn } from "@/lib/utils";

const FONT_SIZE_CLASSES = [
  "text-[9px]",
  "text-[10px]",
  "text-[11px]",
  "text-[12px]",
  "text-[13px]",
  "text-[14px]",
  "text-[15px]",
  "text-[16px]",
  "text-[17px]",
  "text-[18px]",
];

export function StreamViewer({
  id,
  stream,
  from,
  to,
}: {
  id: string;
  stream: string;
  from: string;
  to: string;
}) {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const [follow, setFollow] = useState(true);
  const [wordWrap, setWordWrap] = useLocalStorage(
    "log-viewer-word-wrap",
    false,
    {
      deserializer: (value) => value === "true",
    }
  );
  const [query, setQuery] = useState("");
  const searchInput = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useLocalStorage("log-viewer-font-size", 10, {
    deserializer: (value) => {
      const size = Number(JSON.parse(value));
      return Number.isInteger(size) && size >= 9 && size <= 18 ? size : 10;
    },
  });
  const { pages, loading, error, reset, failedDirection, load } = useLogStream(
    id,
    stream,
    from,
    to,
    follow
  );
  const viewport = useRef<HTMLDivElement>(null);
  const search = useLogSearch(viewport, pages, query);
  const segments = pages.flatMap((page) => page.segments);
  const anchor = useRef<{
    pages: typeof pages;
    segment: string;
    top: number;
  } | null>(null);
  const olderPending = useRef(false);
  const first = pages[0];
  const reduceMotion = useReducedMotion();
  const hasContent = pages.some((page) => page.segments.length > 0);

  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) {
      return;
    }
    if (anchor.current) {
      if (pages === anchor.current.pages) {
        return;
      }
      const retained = Array.from(
        element.querySelectorAll<HTMLElement>("[data-log-segment]")
      ).find(
        (segment) => segment.dataset.logSegment === anchor.current?.segment
      );
      if (retained) {
        element.scrollTop +=
          retained.getBoundingClientRect().top -
          element.getBoundingClientRect().top -
          anchor.current.top;
      }
      anchor.current = null;
    } else if (follow) {
      element.scrollTop = element.scrollHeight;
    }
  }, [pages, follow, fontSize]);

  async function older() {
    if (olderPending.current || loading || !first?.hasOlder) {
      return;
    }
    olderPending.current = true;
    setFollow(false);
    const element = viewport.current;
    if (element) {
      const top = element.getBoundingClientRect().top;
      const visible = Array.from(
        element.querySelectorAll<HTMLElement>("[data-log-segment]")
      ).find((segment) => segment.getBoundingClientRect().bottom > top);
      if (visible?.dataset.logSegment) {
        anchor.current = {
          pages,
          segment: visible.dataset.logSegment,
          top: visible.getBoundingClientRect().top - top,
        };
      }
    }
    if (!(await load("older"))) {
      anchor.current = null;
    }
    olderPending.current = false;
  }

  return (
    <section
      aria-label={`${copy.content}: ${stream}`}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <Separator />
      <LogToolbar
        canLoadOlder={!!first?.hasOlder}
        follow={follow}
        fontSize={fontSize}
        loading={loading}
        onFollow={(checked) => {
          anchor.current = null;
          if (checked) {
            setQuery("");
          }
          setFollow(checked);
        }}
        onFontSize={setFontSize}
        onLatest={() => {
          anchor.current = null;
          setQuery("");
          setFollow(true);
          load("latest");
        }}
        onOlder={older}
        onWordWrap={(checked) => {
          setWordWrap(checked);
          if (checked && viewport.current) {
            viewport.current.scrollLeft = 0;
          }
        }}
        search={{
          ...search,
          query,
          inputRef: searchInput,
          onChange: (value) => {
            setQuery(value);
            if (value) {
              setFollow(false);
            }
          },
        }}
        wordWrap={wordWrap}
      />
      {error && (
        <div className="shrink-0 px-4 pb-3 md:px-5">
          <Alert variant="destructive">
            <AlertTitle>{copy.error}</AlertTitle>
            <AlertDescription>
              {error}
              <Button
                disabled={loading}
                onClick={() => {
                  if (failedDirection === "older") {
                    older();
                  } else {
                    load(failedDirection);
                  }
                }}
                size="sm"
                variant="outline"
              >
                {copy.retry}
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}
      {reset && (
        <div className="max-h-28 shrink-0 overflow-auto px-4 pb-3 md:px-5">
          <Alert>
            <AlertDescription>{copy.reset}</AlertDescription>
          </Alert>
        </div>
      )}
      <Separator />
      <div className="flex min-h-0 flex-1 flex-col bg-muted/15">
        <ScrollArea
          aria-busy={loading}
          aria-label={copy.content}
          className="min-h-0 flex-1"
          contentClassName={wordWrap ? "w-full min-w-0" : "min-w-full"}
          onScrollCapture={(event) => {
            const element = viewport.current;
            if (!element || event.target !== element) {
              return;
            }
            if (
              element.scrollHeight - element.scrollTop - element.clientHeight >
              80
            ) {
              setFollow(false);
            }
            if (!query && element.scrollTop === 0) {
              older();
            }
          }}
          viewportRef={viewport}
        >
          <motion.div
            animate={{ opacity: hasContent ? 1 : 0.65 }}
            className="min-w-0 px-4 pb-5 md:px-5"
            initial={false}
            transition={{
              duration: reduceMotion
                ? MOTION_DURATION.instant
                : MOTION_DURATION.fast,
              ease: MOTION_EASE.out,
            }}
          >
            {hasContent
              ? segments.map((segment, index) => (
                  <div
                    data-log-segment={`${segment.filename}:${segment.offset}`}
                    key={`${segment.filename}:${segment.offset}`}
                  >
                    {(index === 0 ||
                      segments[index - 1].filename !== segment.filename) && (
                      <div className="flex flex-wrap items-center gap-2 py-4">
                        <Badge mono radius="rounded" variant="outline-muted">
                          {segment.date}
                        </Badge>
                        <FileText
                          aria-hidden="true"
                          className="size-3.5 text-muted-foreground"
                        />
                        <span className="break-all font-mono text-muted-foreground text-xs">
                          {segment.filename}
                        </span>
                      </div>
                    )}
                    <pre
                      className={cn(
                        "font-mono leading-relaxed",
                        wordWrap
                          ? "whitespace-pre-wrap break-all"
                          : "whitespace-pre",
                        FONT_SIZE_CLASSES[fontSize - 9]
                      )}
                      data-log-text={segment.filename}
                    >
                      <IsoLogPayload text={segment.text} />
                    </pre>
                  </div>
                ))
              : null}
            {!hasContent && loading && (
              <div
                aria-label={copy.loading}
                className="flex flex-col gap-3 py-5"
                role="status"
              >
                <Skeleton className="h-5 w-56" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-5/6" />
                <span className="sr-only">{copy.loading}</span>
              </div>
            )}
            {!(hasContent || loading) && (
              <Empty className="min-h-0">
                <EmptyHeader>
                  <EmptyTitle>{copy.noFiles}</EmptyTitle>
                  <EmptyDescription>{copy.noFilesHint}</EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </motion.div>
          {!wordWrap && <ScrollBar orientation="horizontal" />}
        </ScrollArea>
      </div>
      <Separator />
      <div className="flex shrink-0 items-center justify-between gap-3 px-3 py-2">
        <p className="hidden truncate text-muted-foreground text-xs sm:block">
          {copy.bufferHint}
        </p>
        <span className="flex shrink-0 items-center gap-1.5 text-muted-foreground text-xs">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          {copy.readOnly}
        </span>
      </div>
    </section>
  );
}
