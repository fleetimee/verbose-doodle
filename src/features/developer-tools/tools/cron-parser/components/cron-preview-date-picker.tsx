import { CronDate } from "cron-parser";
import { format, parseISO } from "date-fns";
import { enUS, id as idLocale } from "date-fns/locale";
import { useState } from "react";
import { CalendarDays } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { messages } from "@/lib/i18n";

export function CronPreviewDatePicker({
  id = "cron-preview-from",
  value,
  timeZone,
  onChange,
}: {
  readonly id?: string;
  readonly value: string;
  readonly timeZone: string;
  readonly onChange: (value: string) => void;
}) {
  const { locale } = useI18n();
  const [open, setOpen] = useState(false);
  const dateLocale = locale === "id-ID" ? idLocale : enUS;
  const selectedDate = value ? parseISO(value) : undefined;
  const now = new CronDate(undefined, timeZone);
  const activeDate =
    selectedDate ?? new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const hours = value ? value.slice(11, 13) : "00";
  const minutes = value ? value.slice(14, 16) : "00";
  const copy = messages.cronParser.enhancements;
  const setTime = (hour: string, minute: string) => {
    const nextHour = String(
      Math.min(23, Math.max(0, Number(hour) || 0))
    ).padStart(2, "0");
    const nextMinute = String(
      Math.min(59, Math.max(0, Number(minute) || 0))
    ).padStart(2, "0");
    onChange(`${format(activeDate, "yyyy-MM-dd")}T${nextHour}:${nextMinute}`);
  };
  return (
    <>
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-describedby={`${id}-help`}
            className="w-full justify-start"
            id={id}
            size="sm"
            type="button"
            variant="outline"
          >
            <CalendarDays data-icon="inline-start" />
            <span className="truncate">
              {selectedDate
                ? format(selectedDate, "dd MMM yyyy, HH:mm", {
                    locale: dateLocale,
                  })
                : copy.now}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-72" size="none">
          <Calendar
            captionLayout="dropdown"
            className="w-full"
            defaultMonth={activeDate}
            endMonth={new Date(2100, 11)}
            locale={dateLocale}
            mode="single"
            onSelect={(date) => {
              if (date) {
                onChange(`${format(date, "yyyy-MM-dd")}T${hours}:${minutes}`);
              }
            }}
            selected={selectedDate}
            startMonth={new Date(1900, 0)}
          />
          <Separator />
          <div className="flex flex-col gap-3 p-3">
            <FieldGroup className="grid grid-cols-2" size="sm">
              <Field size="sm">
                <FieldLabel htmlFor={`${id}-hour`} size="sm">
                  {copy.hours}
                </FieldLabel>
                <Input
                  id={`${id}-hour`}
                  inputMode="numeric"
                  max={23}
                  min={0}
                  onChange={(event) =>
                    setTime(event.currentTarget.value, minutes)
                  }
                  size="sm"
                  type="number"
                  value={hours}
                  variant="mono"
                />
              </Field>
              <Field size="sm">
                <FieldLabel htmlFor={`${id}-minute`} size="sm">
                  {copy.minutes}
                </FieldLabel>
                <Input
                  id={`${id}-minute`}
                  inputMode="numeric"
                  max={59}
                  min={0}
                  onChange={(event) =>
                    setTime(hours, event.currentTarget.value)
                  }
                  size="sm"
                  type="number"
                  value={minutes}
                  variant="mono"
                />
              </Field>
            </FieldGroup>
            <p className="text-muted-foreground text-xs" id={`${id}-help`}>
              {timeZone}
            </p>
            <div className="flex justify-between gap-2">
              <Button
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                size="sm"
                type="button"
                variant="ghost"
              >
                {copy.useNow}
              </Button>
              <Button onClick={() => setOpen(false)} size="sm" type="button">
                {copy.done}
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <span className="sr-only" id={`${id}-help`}>
        {timeZone}
      </span>
    </>
  );
}
