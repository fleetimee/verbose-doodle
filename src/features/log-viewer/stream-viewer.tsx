import { motion, useReducedMotion } from "motion/react";
import { useLayoutEffect, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { LogFileHeader } from "@/features/log-viewer/log-file-header";
import { LogPayload } from "@/features/log-viewer/log-payload";
import { LogSelectionAction } from "@/features/log-viewer/log-selection-action";
import { LogToolbar } from "@/features/log-viewer/log-toolbar";
import { LogContentSkeleton } from "@/features/log-viewer/log-viewer-skeleton";
import type { LogSegment } from "@/features/log-viewer/types";
import { useLogSearch } from "@/features/log-viewer/use-log-search";
import { useLogStream } from "@/features/log-viewer/use-log-stream";
import { logSourceHref } from "@/features/log-viewer/use-log-viewer-location";
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

function downloadLogText(
  files: { filename: string; date: string; segments: LogSegment[] }[],
  stream: string,
  from: string,
  to: string,
  filtered: boolean
) {
  const parts = files.map((file) => {
    const body = file.segments.map((segment) => segment.text).join("");
    return files.length > 1
      ? `=== ${file.date} · ${file.filename} ===\n${body}`
      : body;
  });
  const blob = new Blob([parts.join("\n")], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const safeStream = stream.replace(/[^a-zA-Z0-9._-]+/g, "_");
  const range = to ? `${from}_to_${to}` : from;
  link.href = url;
  link.download = `${safeStream}-${range}${filtered ? "-filtered" : ""}.txt`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
function groupLogSegments(segments: LogSegment[]) {
  const files: { filename: string; date: string; segments: LogSegment[] }[] =
    [];
  for (const segment of segments) {
    const previous = files.at(-1);
    if (previous?.filename === segment.filename) {
      previous.segments.push(segment);
    } else {
      files.push({
        filename: segment.filename,
        date: segment.date,
        segments: [segment],
      });
    }
  }
  return files;
}

const LOG_ENTRY_START =
  /^(?:\[(?:\d{2}[/-]\d{2}[/-]\d{4}[ \t]+|\d{4}[/-]\d{2}[/-]\d{2}[ \tT]+)?\d{2}:\d{2}:\d{2}|(?:\d{4}[/-]\d{2}[/-]\d{2}|\d{2}[/-]\d{2}[/-]\d{4})[ \tT]+\d{2}:\d{2}:\d{2}|\d{2}:\d{2}:\d{2}(?:[.,]\d+)?[ \t]+|[A-Z][a-z]{2}[ \t]+\d{1,2}[ \t]+\d{2}:\d{2}:\d{2})/;

function splitLogEntries(text: string): string[] {
  const lines = text.split("\n");
  if (lines.at(-1) === "") {
    lines.pop();
  }
  const hasTimestampedEntries = lines.some((line) =>
    LOG_ENTRY_START.test(line)
  );
  if (!hasTimestampedEntries) {
    return lines.map((line) => `${line}\n`);
  }
  const entries: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (LOG_ENTRY_START.test(line) && current.length > 0) {
      entries.push(`${current.join("\n")}\n`);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    entries.push(`${current.join("\n")}\n`);
  }
  return entries;
}

function filterLogFiles(
  files: { filename: string; date: string; segments: LogSegment[] }[],
  query: string
) {
  const needle = query.toLocaleLowerCase();
  if (!needle) {
    return files;
  }
  const filtered: { filename: string; date: string; segments: LogSegment[] }[] =
    [];
  for (const file of files) {
    const firstSegment = file.segments[0];
    if (!firstSegment) {
      continue;
    }
    const fullText = file.segments.map((segment) => segment.text).join("");
    const matchingEntries = splitLogEntries(fullText).filter((entry) =>
      entry.toLocaleLowerCase().includes(needle)
    );
    if (matchingEntries.length > 0) {
      filtered.push({
        ...file,
        segments: [
          {
            ...firstSegment,
            text: matchingEntries.join(""),
          },
        ],
      });
    }
  }
  return filtered;
}

export function StreamViewer({
  id,
  stream,
  from,
  to,
  fullscreen,
  fullscreenSupported,
  maximized,
  onFullscreen,
  onMaximize,
}: {
  id: string;
  stream: string;
  from: string;
  to: string;
  fullscreen: boolean;
  fullscreenSupported: boolean;
  maximized: boolean;
  onFullscreen: () => void;
  onMaximize: () => void;
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
  const [filterMatches, setFilterMatches] = useLocalStorage(
    "log-viewer-filter-matches",
    false,
    {
      deserializer: (value) => value === "true",
    }
  );
  const searchInput = useRef<HTMLInputElement>(null);
  const [fontSize, setFontSize] = useLocalStorage("log-viewer-font-size", 10, {
    deserializer: (value) => {
      const size = Number(JSON.parse(value));
      return Number.isInteger(size) && size >= 9 && size <= 18 ? size : 10;
    },
  });
  const {
    pages,
    loading,
    loadingDirection,
    error,
    reset,
    failedDirection,
    load,
  } = useLogStream(id, stream, from, to, follow);
  const viewport = useRef<HTMLDivElement>(null);
  const previousScrollTop = useRef(0);
  const search = useLogSearch(viewport, pages, query, filterMatches);
  const allFiles = groupLogSegments(pages.flatMap((page) => page.segments));
  const files =
    filterMatches && query ? filterLogFiles(allFiles, query) : allFiles;
  const anchor = useRef<{
    pages: typeof pages;
    segment: string;
    top: number;
  } | null>(null);
  const olderPending = useRef(false);
  const first = pages[0];
  const reduceMotion = useReducedMotion();
  const hasContent = pages.some((page) => page.segments.length > 0);
  const showEmpty = !(hasContent || loading);
  const showFilteredEmpty =
    hasContent && Boolean(filterMatches && query) && files.length === 0;

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
    } else if (follow && hasContent) {
      element.scrollTop = element.scrollHeight;
    }
    previousScrollTop.current = element.scrollTop;
  }, [pages, follow, fontSize, fullscreen, maximized, hasContent]);

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
        canExport={files.length > 0}
        canLoadOlder={!!first?.hasOlder}
        dedicatedHref={logSourceHref(id, from, to, stream)}
        follow={follow}
        fontSize={fontSize}
        fullscreen={fullscreen}
        fullscreenSupported={fullscreenSupported}
        loading={loading}
        maximized={maximized}
        onExport={() =>
          downloadLogText(
            files,
            stream,
            from,
            to,
            Boolean(filterMatches && query)
          )
        }
        onFollow={(checked) => {
          anchor.current = null;
          if (checked) {
            setQuery("");
          }
          setFollow(checked);
        }}
        onFontSize={setFontSize}
        onFullscreen={onFullscreen}
        onLatest={() => {
          anchor.current = null;
          setQuery("");
          setFollow(true);
          load("latest");
        }}
        onMaximize={onMaximize}
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
          filterMatches,
          inputRef: searchInput,
          onFilterMatchesChange: setFilterMatches,
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
      <div className="relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-muted/15">
        <img
          alt=""
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute right-3 bottom-2 h-auto max-w-[45%] select-none object-contain object-right-bottom opacity-10 dark:opacity-15",
            fullscreen || maximized
              ? "max-h-[85%] w-56 sm:w-80 lg:w-112"
              : "max-h-[75%] w-40 sm:w-56 lg:w-80"
          )}
          decoding="async"
          draggable={false}
          height={960}
          loading="lazy"
          src="/brand/biller-operator-mascot-log-viewer.webp"
          width={640}
        />
        {loadingDirection === "older" && (
          <div
            aria-live="polite"
            className="flex shrink-0 items-center justify-center gap-2 border-b py-2 text-muted-foreground text-xs"
            role="status"
          >
            <Spinner />
            {copy.loadingOlder}
          </div>
        )}
        <ScrollArea
          aria-busy={loading}
          aria-label={copy.content}
          className={cn(
            "min-h-0 flex-1",
            (showEmpty || showFilteredEmpty) && "hidden"
          )}
          contentClassName={wordWrap ? "w-full min-w-0" : "min-w-full"}
          onScrollCapture={(event) => {
            const element = viewport.current;
            if (!element || event.target !== element) {
              return;
            }
            const scrollTop = Math.max(0, element.scrollTop);
            const previousTop = previousScrollTop.current;
            previousScrollTop.current = scrollTop;
            if (scrollTop === previousTop) {
              return;
            }
            if (
              element.scrollHeight - element.scrollTop - element.clientHeight >
              80
            ) {
              setFollow(false);
            }
            if (!query && scrollTop === 0 && scrollTop < previousTop) {
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
              ? files.map((file) => (
                  <div key={`${file.filename}:${file.segments[0].offset}`}>
                    <LogFileHeader file={file} />
                    {file.segments.map((segment) => (
                      <div
                        data-log-segment={`${segment.filename}:${segment.offset}`}
                        key={`${segment.filename}:${segment.offset}`}
                      >
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
                          <LogPayload text={segment.text} />
                        </pre>
                      </div>
                    ))}
                  </div>
                ))
              : null}
            {!hasContent && loading && (
              <LogContentSkeleton
                fontClassName={FONT_SIZE_CLASSES[fontSize - 9]}
              />
            )}
          </motion.div>
          {!wordWrap && <ScrollBar orientation="horizontal" />}
        </ScrollArea>
        <LogSelectionAction viewportRef={viewport} />
        {showEmpty && (
          <Empty className="relative min-h-0">
            <EmptyHeader>
              <EmptyTitle>{copy.noFiles}</EmptyTitle>
              <EmptyDescription>{copy.noFilesHint}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {showFilteredEmpty && (
          <Empty className="relative min-h-0">
            <EmptyHeader>
              <EmptyTitle>{copy.noSearchMatches}</EmptyTitle>
              <EmptyDescription>{copy.searchScope}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </section>
  );
}
