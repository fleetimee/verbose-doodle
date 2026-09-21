import { addDays, endOfDay, startOfDay, startOfMonth } from "date-fns";
import { useEffect, useState } from "react";
import { CalendarDays, Clock3, TimerReset } from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { messages } from "@/lib/i18n";

type DatePickerPopoverProps = {
  readonly currentDate: Date | null;
  readonly disabled?: boolean;
  readonly onDateChange: (date: Date) => void;
};

export function DatePickerPopover({
  currentDate,
  disabled = false,
  onDateChange,
}: DatePickerPopoverProps) {
  const [open, setOpen] = useState(false);

  const activeDate = currentDate ?? new Date();
  const [hours, setHours] = useState(
    String(activeDate.getUTCHours()).padStart(2, "0")
  );
  const [minutes, setMinutes] = useState(
    String(activeDate.getUTCMinutes()).padStart(2, "0")
  );
  const [seconds, setSeconds] = useState(
    String(activeDate.getUTCSeconds()).padStart(2, "0")
  );

  useEffect(() => {
    if (currentDate) {
      setHours(String(currentDate.getUTCHours()).padStart(2, "0"));
      setMinutes(String(currentDate.getUTCMinutes()).padStart(2, "0"));
      setSeconds(String(currentDate.getUTCSeconds()).padStart(2, "0"));
    }
  }, [currentDate]);

  const handleSelectDay = (day: Date | undefined) => {
    if (!day) {
      return;
    }
    const next = new Date(day);
    next.setUTCHours(
      Number(hours) || 0,
      Number(minutes) || 0,
      Number(seconds) || 0,
      0
    );
    onDateChange(next);
  };

  const updateTime = (newH: string, newM: string, newS: string) => {
    const validH = Math.min(23, Math.max(0, Number(newH) || 0));
    const validM = Math.min(59, Math.max(0, Number(newM) || 0));
    const validS = Math.min(59, Math.max(0, Number(newS) || 0));

    setHours(String(validH).padStart(2, "0"));
    setMinutes(String(validM).padStart(2, "0"));
    setSeconds(String(validS).padStart(2, "0"));

    const next = new Date(currentDate ?? new Date());
    next.setUTCHours(validH, validM, validS, 0);
    onDateChange(next);
  };

  const handlePreset = (factory: (base: Date) => Date) => {
    const next = factory(new Date());
    setHours(String(next.getUTCHours()).padStart(2, "0"));
    setMinutes(String(next.getUTCMinutes()).padStart(2, "0"));
    setSeconds(String(next.getUTCSeconds()).padStart(2, "0"));
    onDateChange(next);
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={messages.dateConverter.picker.buttonLabel}
          className="size-12 shrink-0"
          disabled={disabled}
          size="icon-lg"
          type="button"
          variant="outline"
        >
          <CalendarDays data-icon="inline-start" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-4"
        side="bottom"
        size="none"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between border-b pb-2">
            <span className="font-medium text-xs">
              {messages.dateConverter.picker.title}
            </span>
            <Button
              onClick={() => handlePreset(() => new Date())}
              size="xs"
              type="button"
              variant="ghost"
            >
              <TimerReset data-icon="inline-start" />
              {messages.dateConverter.picker.now}
            </Button>
          </div>

          <div className="flex flex-wrap gap-1">
            <Button
              onClick={() => handlePreset((d) => startOfDay(d))}
              size="xs"
              type="button"
              variant="outline"
            >
              {messages.dateConverter.picker.today}
            </Button>
            <Button
              onClick={() => handlePreset((d) => startOfDay(addDays(d, 1)))}
              size="xs"
              type="button"
              variant="outline"
            >
              {messages.dateConverter.picker.tomorrow}
            </Button>
            <Button
              onClick={() => handlePreset((d) => addDays(d, 7))}
              size="xs"
              type="button"
              variant="outline"
            >
              {messages.dateConverter.picker.plus7Days}
            </Button>
            <Button
              onClick={() => handlePreset((d) => addDays(d, 30))}
              size="xs"
              type="button"
              variant="outline"
            >
              {messages.dateConverter.picker.plus30Days}
            </Button>
            <Button
              onClick={() => handlePreset((d) => startOfMonth(d))}
              size="xs"
              type="button"
              variant="outline"
            >
              {messages.dateConverter.picker.startOfMonth}
            </Button>
            <Button
              onClick={() => handlePreset((d) => endOfDay(d))}
              size="xs"
              type="button"
              variant="outline"
            >
              {messages.dateConverter.picker.endOfDay}
            </Button>
          </div>

          <div className="rounded-md border">
            <Calendar
              mode="single"
              onSelect={handleSelectDay}
              selected={currentDate ?? undefined}
            />
          </div>

          <div className="flex items-center justify-between gap-2 border-t pt-3">
            <div className="flex items-center gap-1.5">
              <Clock3 className="size-4 text-muted-foreground" />
              <Label
                className="font-mono text-muted-foreground text-xs"
                size="sm"
              >
                UTC
              </Label>
            </div>
            <div className="flex items-center gap-1">
              <Input
                aria-label={messages.dateConverter.picker.hours}
                className="h-8 w-11 px-1 text-center font-mono text-xs"
                maxLength={2}
                onChange={(e) => updateTime(e.target.value, minutes, seconds)}
                value={hours}
              />
              <span className="text-muted-foreground text-xs">:</span>
              <Input
                aria-label={messages.dateConverter.picker.minutes}
                className="h-8 w-11 px-1 text-center font-mono text-xs"
                maxLength={2}
                onChange={(e) => updateTime(hours, e.target.value, seconds)}
                value={minutes}
              />
              <span className="text-muted-foreground text-xs">:</span>
              <Input
                aria-label={messages.dateConverter.picker.seconds}
                className="h-8 w-11 px-1 text-center font-mono text-xs"
                maxLength={2}
                onChange={(e) => updateTime(hours, minutes, e.target.value)}
                value={seconds}
              />
            </div>
            <div className="flex items-center gap-1">
              <Button
                onClick={() => updateTime("00", "00", "00")}
                size="xs"
                type="button"
                variant="ghost"
              >
                {messages.dateConverter.picker.midnight}
              </Button>
              <Button
                onClick={() => updateTime("12", "00", "00")}
                size="xs"
                type="button"
                variant="ghost"
              >
                {messages.dateConverter.picker.noon}
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
