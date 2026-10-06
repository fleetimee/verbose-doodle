import { Calendar03Icon, Clock01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { format } from "date-fns";
import { enUS, id } from "date-fns/locale";
import { useId, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export function TrafficSincePicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { locale, messages } = useI18n();
  const copy = messages.endpoints.globalConsole;
  const calendarLocale = locale === "id-ID" ? id : enUS;
  const timeId = useId();
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState<Date>();
  const [time, setTime] = useState("00:00");
  const selected = value ? new Date(value) : undefined;

  return (
    <Popover
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setDate(selected);
          setTime(value ? value.slice(11, 16) : "00:00");
        }
        setOpen(nextOpen);
      }}
      open={open}
    >
      <PopoverTrigger
        render={
          <Button
            aria-label={copy.since}
            className="w-full min-w-0 justify-start"
            title={
              selected
                ? format(selected, "PPp", { locale: calendarLocale })
                : copy.since
            }
            variant="outline"
          />
        }
      >
        <HugeiconsIcon
          data-icon="inline-start"
          icon={Calendar03Icon}
          strokeWidth={2}
        />
        <span
          className={selected ? "truncate" : "truncate text-muted-foreground"}
        >
          {selected
            ? format(selected, "dd MMM yyyy, HH:mm", { locale: calendarLocale })
            : copy.since}
        </span>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-auto max-w-[calc(100vw-2rem)]"
        size="none"
      >
        <div className="border-b px-3 py-2.5">
          <p className="font-medium text-sm">{copy.since}</p>
        </div>
        <Calendar
          defaultMonth={date}
          locale={calendarLocale}
          mode="single"
          onSelect={setDate}
          selected={date}
        />
        <div className="grid gap-3 border-t p-3">
          <div className="flex items-center justify-between gap-4">
            <label
              className="flex items-center gap-2 text-muted-foreground text-sm"
              htmlFor={timeId}
            >
              <HugeiconsIcon
                className="size-4"
                icon={Clock01Icon}
                strokeWidth={2}
              />
              {copy.time}
            </label>
            <Input
              className="w-28"
              id={timeId}
              onChange={(event) => setTime(event.target.value)}
              step={60}
              type="time"
              value={time}
              variant="mono"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <Button
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              size="sm"
              variant="ghost"
            >
              {copy.clearDate}
            </Button>
            <Button
              disabled={!(date && time)}
              onClick={() => {
                if (date && time) {
                  onChange(`${format(date, "yyyy-MM-dd")}T${time}`);
                  setOpen(false);
                }
              }}
              size="sm"
            >
              {messages.common.apply}
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
