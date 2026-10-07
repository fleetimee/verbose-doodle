import { type CSSProperties, useState } from "react";
import {
  Braces,
  CalendarDays,
  Clock3,
  FileClock,
} from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CronPreviewCalendar } from "@/features/developer-tools/tools/cron-parser/components/cron-preview-calendar";
import { CronSavedSchedules } from "@/features/developer-tools/tools/cron-parser/components/cron-saved-schedules";
import type { CronPreview } from "@/features/developer-tools/tools/cron-parser/cron-preview";
import { formatMessage, messages } from "@/lib/i18n";
import { MOTION_DURATION, MOTION_EASE } from "@/lib/motion";

export function CronPreviewResults({
  preview,
  onLoad,
  fieldsId,
  runsId,
}: {
  readonly preview: CronPreview | null;
  readonly onLoad: (expression: string, timeZone: string) => void;
  readonly fieldsId: string;
  readonly runsId: string;
}) {
  const { locale } = useI18n();
  const [animateTabs, setAnimateTabs] = useState(false);
  const panelStyle: CSSProperties &
    Record<"--cron-tab-duration" | "--cron-tab-ease", string> = {
    "--cron-tab-duration": `${MOTION_DURATION.fast}s`,
    "--cron-tab-ease": `cubic-bezier(${MOTION_EASE.out.join(",")})`,
  };
  const [page, setPage] = useState(0);
  const [entryIndex, setEntryIndex] = useState(0);
  const copy = messages.cronParser.enhancements;
  const pageCount = Math.max(1, Math.ceil((preview?.nextRuns.length ?? 0) / 5));
  const activePage = Math.min(page, pageCount - 1);
  const entry =
    preview?.entries[Math.min(entryIndex, preview.entries.length - 1)];
  const calendar = preview ? (
    <CronPreviewCalendar
      key={`${preview.timeZone}-${preview.currentDate.toISOString()}`}
      preview={preview}
    />
  ) : (
    <p className="p-4 text-muted-foreground text-sm">{copy.emptyPreview}</p>
  );
  return (
    <div className="grid min-h-0 flex-1 overflow-hidden rounded-xl border border-border/70 bg-background/50 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <Tabs className="min-h-0" defaultValue="runs" variant="flush">
        <div className="flex shrink-0 items-center border-b px-3 py-2">
          <TabsList
            onKeyDownCapture={() => setAnimateTabs(false)}
            onPointerDownCapture={() => setAnimateTabs(true)}
            size="sm"
            variant="subtle"
          >
            <TabsTrigger size="sm" value="runs">
              <Clock3 aria-hidden="true" />
              {copy.runsTab}
            </TabsTrigger>
            <TabsTrigger size="sm" value="fields">
              <Braces aria-hidden="true" />
              {copy.fieldsTab}
            </TabsTrigger>
            <TabsTrigger className="lg:hidden" size="sm" value="calendar">
              <CalendarDays aria-hidden="true" />
              {copy.calendarTab}
            </TabsTrigger>
            <TabsTrigger size="sm" value="saved">
              <FileClock aria-hidden="true" />
              {copy.savedTab}
            </TabsTrigger>
          </TabsList>
        </div>
        <div
          className="cron-preview-tab-panels grid min-h-0 flex-1"
          data-animate-tabs={animateTabs}
          style={panelStyle}
        >
          <TabsContent
            className="col-start-1 row-start-1 min-h-0"
            keepMounted
            value="runs"
          >
            <section className="flex h-full min-h-0 flex-col" id={runsId}>
              <div className="flex shrink-0 items-center justify-between gap-3 px-4 py-3">
                <h2 className="font-semibold text-sm">
                  {messages.cronParser.upcomingRuns}
                </h2>
                <span className="truncate text-muted-foreground text-xs">
                  {preview?.timeZone}
                </span>
              </div>
              {preview ? (
                <>
                  <ol className="flex min-h-0 flex-1 flex-col divide-y px-4">
                    {preview.nextRuns
                      .slice(activePage * 5, activePage * 5 + 5)
                      .map((date, index) => (
                        <li
                          className="flex min-h-0 flex-1 items-center gap-3 py-2"
                          key={date.toISOString()}
                        >
                          <span className="font-mono text-muted-foreground text-xs">
                            {String(activePage * 5 + index + 1).padStart(
                              2,
                              "0"
                            )}
                          </span>
                          <time
                            className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs"
                            dateTime={date.toISOString()}
                          >
                            <span>
                              {new Intl.DateTimeFormat(locale, {
                                weekday: "short",
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                timeZone: preview.timeZone,
                              }).format(date)}
                            </span>
                            <span className="font-mono">
                              {new Intl.DateTimeFormat(locale, {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false,
                                timeZone: preview.timeZone,
                                timeZoneName: "shortOffset",
                              }).format(date)}
                            </span>
                          </time>
                        </li>
                      ))}
                  </ol>
                  <div className="flex shrink-0 items-center justify-between gap-2 border-t px-4 py-2">
                    <span className="text-muted-foreground text-xs">
                      {formatMessage(copy.page, {
                        page: activePage + 1,
                        pages: pageCount,
                      })}
                    </span>
                    <div className="flex gap-1">
                      <Button
                        disabled={activePage === 0}
                        onClick={() => setPage(activePage - 1)}
                        size="xs"
                        type="button"
                        variant="ghost"
                      >
                        {copy.previous}
                      </Button>
                      <Button
                        disabled={activePage === pageCount - 1}
                        onClick={() => setPage(activePage + 1)}
                        size="xs"
                        type="button"
                        variant="outline"
                      >
                        {copy.next}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <p className="px-4 text-muted-foreground text-sm">
                  {copy.emptyPreview}
                </p>
              )}
            </section>
          </TabsContent>
          <TabsContent
            className="col-start-1 row-start-1 min-h-0"
            keepMounted
            value="fields"
          >
            <section
              className="flex h-full min-h-0 flex-col gap-2 p-4"
              id={fieldsId}
            >
              {preview && entry ? (
                <>
                  <Select
                    onValueChange={(value) => setEntryIndex(Number(value))}
                    value={String(
                      Math.min(entryIndex, preview.entries.length - 1)
                    )}
                  >
                    <SelectTrigger
                      aria-label={messages.cronParser.expressionLabel}
                      className="w-full"
                      size="sm"
                      variant="surface"
                    >
                      <SelectValue>{entry.normalizedExpression}</SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        {preview.entries.map((item, index) => (
                          <SelectItem
                            key={item.normalizedExpression}
                            value={String(index)}
                          >
                            {item.normalizedExpression}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <p
                    className="truncate text-muted-foreground text-xs"
                    title={entry.description}
                  >
                    {entry.description}
                  </p>
                  <dl className="flex min-h-0 flex-1 flex-col divide-y">
                    {entry.fields.map((field) => (
                      <div
                        className="flex min-h-0 flex-1 items-center justify-between gap-3 py-1.5"
                        key={field.key}
                      >
                        <dt
                          className="text-xs"
                          title={formatMessage(
                            messages.cronParser.allowedRange,
                            {
                              range: field.range,
                            }
                          )}
                        >
                          {messages.cronParser.fieldLabels[field.key]}
                        </dt>
                        <dd
                          className="max-w-[60%] truncate font-mono text-xs"
                          title={field.token}
                        >
                          {field.token}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {copy.emptyPreview}
                </p>
              )}
            </section>
          </TabsContent>
          <TabsContent
            className="col-start-1 row-start-1 min-h-0"
            keepMounted
            value="saved"
          >
            <CronSavedSchedules onLoad={onLoad} preview={preview} />
          </TabsContent>
          <TabsContent
            className="col-start-1 row-start-1 min-h-0 lg:hidden"
            keepMounted
            value="calendar"
          >
            {calendar}
          </TabsContent>
        </div>
      </Tabs>
      <div className="hidden min-h-0 border-l lg:block">{calendar}</div>
    </div>
  );
}
