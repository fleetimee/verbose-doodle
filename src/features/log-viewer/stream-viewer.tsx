import { useId, useLayoutEffect, useRef, useState } from "react";
import {
  ChevronDown,
  FileClock,
  FileText,
  ShieldCheck,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { Field, FieldLabel } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { useLogStream } from "@/features/log-viewer/use-log-stream";
import { useLocalStorage } from "@/hooks/use-local-storage";
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
  const followId = useId();
  const segments = pages.flatMap((page) => page.segments);
  const anchor = useRef<{
    pages: typeof pages;
    segment: string;
    top: number;
  } | null>(null);
  const olderPending = useRef(false);
  const first = pages[0];
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

  const followVariant = follow ? "primary-subtle" : "secondary";
  const followLabel = follow ? copy.live : copy.paused;

  return (
    <section
      aria-label={`${copy.content}: ${stream}`}
      className="flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden"
    >
      <Separator />
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 px-3 py-2">
        <div className="flex flex-wrap items-center gap-2">
          <Button
            disabled={loading || !first?.hasOlder}
            onClick={older}
            size="sm"
            variant="outline"
          >
            <FileClock data-icon="inline-start" />
            {copy.older}
          </Button>
          <Button
            disabled={loading}
            onClick={() => {
              anchor.current = null;
              setFollow(true);
              load("latest");
            }}
            size="sm"
            variant="ghost"
          >
            <ChevronDown data-icon="inline-start" />
            {copy.latest}
          </Button>
          {loading && <Spinner aria-label={copy.loading} />}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <ButtonGroup aria-label={copy.fontSize}>
            <Button
              aria-label={copy.decreaseFont}
              disabled={fontSize <= 9}
              onClick={() => setFontSize((size) => Math.max(9, size - 1))}
              size="sm"
              title={copy.decreaseFont}
              variant="outline"
            >
              A−
            </Button>
            <Button
              aria-label={copy.resetFont}
              onClick={() => setFontSize(10)}
              size="sm"
              title={copy.resetFont}
              variant="outline"
            >
              {fontSize}px
            </Button>
            <Button
              aria-label={copy.increaseFont}
              disabled={fontSize >= 18}
              onClick={() => setFontSize((size) => Math.min(18, size + 1))}
              size="sm"
              title={copy.increaseFont}
              variant="outline"
            >
              A+
            </Button>
          </ButtonGroup>
          <Badge variant={error ? "destructive" : followVariant}>
            {error ? copy.unavailable : followLabel}
          </Badge>
          <Field className="w-auto" orientation="horizontal">
            <Switch
              checked={follow}
              id={followId}
              onCheckedChange={(checked) => {
                anchor.current = null;
                setFollow(checked);
              }}
            />
            <FieldLabel htmlFor={followId}>{copy.follow}</FieldLabel>
          </Field>
        </div>
      </div>
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
            if (element.scrollTop === 0) {
              older();
            }
          }}
          viewportRef={viewport}
        >
          <div className="min-w-0 px-4 pb-5 md:px-5">
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
                        "whitespace-pre-wrap break-all font-mono leading-relaxed",
                        FONT_SIZE_CLASSES[fontSize - 9]
                      )}
                    >
                      {segment.text}
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
          </div>
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
