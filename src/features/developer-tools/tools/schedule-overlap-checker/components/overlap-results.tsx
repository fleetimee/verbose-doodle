import { useEffect, useRef, useState } from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { OverlapResult } from "@/features/developer-tools/tools/schedule-overlap-checker/check-schedule-overlap";
import { formatMessage } from "@/lib/i18n";

export function OverlapResults({ result }: { readonly result: OverlapResult }) {
  const { locale, messages } = useI18n();
  const copy = messages.scheduleOverlapChecker;
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const tableContainer = useRef<HTMLDivElement>(null);
  const firstRow = useRef<HTMLTableRowElement>(null);
  useEffect(() => {
    const container = tableContainer.current;
    if (!container) {
      return;
    }
    const measure = () => {
      const rowHeight = Math.max(
        firstRow.current?.getBoundingClientRect().height ?? 32,
        32
      );
      setPageSize(
        Math.max(
          5,
          Math.min(50, Math.floor((container.clientHeight - 32) / rowHeight))
        )
      );
    };
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    measure();
    return () => observer.disconnect();
  }, []);
  const pages = Math.ceil(result.conflicts.length / pageSize);
  const currentPage = Math.min(page, Math.max(0, pages - 1));
  const dateFormat = new Intl.DateTimeFormat(locale, {
    timeZone: result.timeZone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  const axisFormat = new Intl.DateTimeFormat(locale, {
    timeZone: result.timeZone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const numberFormat = new Intl.NumberFormat(locale, {
    maximumFractionDigits: 2,
  });
  const emptyTitle = result.runs.length === 0 ? copy.noRuns : copy.clear;
  const emptyHelp = result.runs.length === 0 ? copy.noRunsHelp : copy.clearHelp;
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-3 p-4">
      <dl aria-live="polite" className="grid grid-cols-3 gap-3">
        {[
          { label: copy.runs, value: result.runs.length },
          { label: copy.conflicts, value: result.conflicts.length },
          { label: copy.peak, value: result.peak },
        ].map(({ label, value }) => (
          <div key={label}>
            <dt className="text-muted-foreground text-xs">{label}</dt>
            <dd className="mt-1 font-mono font-semibold text-lg tabular-nums">
              {numberFormat.format(value)}
            </dd>
          </div>
        ))}
      </dl>
      <Separator />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-muted-foreground text-xs">
          {dateFormat.format(result.start)} – {dateFormat.format(result.end)}
        </p>
        <Badge mono radius="rounded" variant="outline-muted">
          {result.timeZone}
        </Badge>
      </div>
      {result.runs.length > 0 && (
        <section aria-label={copy.activity} className="flex flex-col gap-2">
          <h2 className="font-semibold text-sm">{copy.activity}</h2>
          <ChartContainer
            aria-label={copy.activity}
            className="h-[120px] w-full"
            config={{
              concurrent: { label: copy.activity, color: "var(--primary)" },
            }}
          >
            <AreaChart
              accessibilityLayer
              data={result.activity}
              margin={{ left: -24, right: 8 }}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                axisLine={false}
                dataKey="time"
                domain={[result.start, result.end]}
                minTickGap={48}
                tickFormatter={(value) => axisFormat.format(Number(value))}
                tickLine={false}
                type="number"
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_label, payload) =>
                      dateFormat.format(
                        payload[0]?.payload?.time ?? result.start
                      )
                    }
                  />
                }
              />
              <Area
                dataKey="concurrent"
                fill="var(--color-concurrent)"
                fillOpacity={0.12}
                isAnimationActive={false}
                stroke="var(--color-concurrent)"
                strokeWidth={1.5}
                type="stepAfter"
              />
            </AreaChart>
          </ChartContainer>
        </section>
      )}
      {result.conflicts.length > 0 ? (
        <>
          <div className="min-h-[180px] flex-1 lg:min-h-0" ref={tableContainer}>
            <ScrollArea className="h-full" variant="fit">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="h-8">{copy.jobs}</TableHead>
                    <TableHead className="h-8">{copy.overlapStart}</TableHead>
                    <TableHead className="h-8">{copy.overlapEnd}</TableHead>
                    <TableHead className="h-8">
                      {copy.overlapDuration}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {result.conflicts
                    .slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                    .map((conflict, index) => (
                      <TableRow
                        key={`${conflict.left.scheduleId}-${conflict.left.start}-${conflict.right.scheduleId}-${conflict.right.start}`}
                        ref={index === 0 ? firstRow : undefined}
                      >
                        <TableCell size="compact">
                          <div className="flex max-w-[18rem] flex-col gap-1 whitespace-normal">
                            <span>
                              {conflict.left.name} / {conflict.right.name}
                            </span>
                            {conflict.left.scheduleId ===
                              conflict.right.scheduleId && (
                              <Badge className="w-fit" variant="secondary">
                                {copy.self}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell size="compact" variant="mono">
                          {dateFormat.format(conflict.start)}
                        </TableCell>
                        <TableCell size="compact" variant="mono">
                          {dateFormat.format(conflict.end)}
                        </TableCell>
                        <TableCell size="compact" variant="mono">
                          {numberFormat.format(
                            (conflict.end - conflict.start) / 60_000
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </div>
          <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t pt-3">
            <p className="text-muted-foreground text-xs">
              {formatMessage(copy.showing, {
                count: numberFormat.format(result.conflicts.length),
              })}
            </p>
            <div className="flex items-center gap-1">
              <Button
                disabled={currentPage === 0}
                onClick={() => setPage(currentPage - 1)}
                size="xs"
                variant="outline"
              >
                {copy.previous}
              </Button>
              <span className="px-1 text-muted-foreground text-xs">
                {formatMessage(copy.page, { page: currentPage + 1, pages })}
              </span>
              <Button
                disabled={currentPage + 1 >= pages}
                onClick={() => setPage(currentPage + 1)}
                size="xs"
                variant="outline"
              >
                {copy.next}
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Empty size="compact" variant="plain">
          <EmptyHeader>
            <EmptyTitle>{emptyTitle}</EmptyTitle>
            <EmptyDescription>{emptyHelp}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
    </div>
  );
}
