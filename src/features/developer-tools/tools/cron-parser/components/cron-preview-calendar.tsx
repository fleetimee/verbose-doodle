import { CronDate } from "cron-parser";
import { enUS, id } from "date-fns/locale";
import { useMemo, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  type CronPreview,
  getCalendarRunDays,
  getScheduleWarnings,
} from "@/features/developer-tools/tools/cron-parser/cron-preview";
import { formatMessage, messages } from "@/lib/i18n";

export function CronPreviewCalendar({
  preview,
}: {
  readonly preview: CronPreview;
}) {
  const { locale } = useI18n();
  const [month, setMonth] = useState(() => {
    const date = new CronDate(preview.currentDate, preview.timeZone);
    return new Date(date.getFullYear(), date.getMonth(), 1);
  });
  const days = useMemo(
    () => getCalendarRunDays(preview, month),
    [preview, month]
  );
  const warnings = useMemo(
    () => getScheduleWarnings(preview),
    [preview, locale]
  );
  const copy = messages.cronParser.enhancements;
  return (
    <section
      aria-label={copy.calendar}
      className="flex h-full min-h-0 flex-col"
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b px-4 py-3">
        <h2 className="font-semibold text-sm">{copy.calendar}</h2>
        <Badge variant="outline">{preview.timeZone}</Badge>
      </div>
      <div className="flex min-h-0 flex-1 items-start justify-center px-3 pt-1">
        <Calendar
          className="w-full max-w-80"
          dayVariant="circle"
          fixedWeeks
          locale={locale === "id-ID" ? id : enUS}
          mode="multiple"
          month={month}
          onMonthChange={setMonth}
          onSelect={() => undefined}
          selected={days}
          showOutsideDays={false}
        />
      </div>
      <div className="flex shrink-0 items-center justify-between gap-2 border-t px-4 py-2">
        <p className="text-muted-foreground text-xs" role="status">
          {formatMessage(copy.calendarCount, { count: days.length })}
        </p>
        {warnings.length ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button size="xs" type="button" variant="outline">
                {formatMessage(copy.notesCount, { count: warnings.length })}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80">
              <h3 className="mb-2 font-semibold text-sm">{copy.warnings}</h3>
              <ul className="flex list-disc flex-col gap-2 pl-4 text-muted-foreground text-xs">
                {warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
    </section>
  );
}
