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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
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

  const handlePresetValue = (value: string) => {
    const presets: Readonly<Record<string, (base: Date) => Date>> = {
      today: (date) => startOfDay(date),
      tomorrow: (date) => startOfDay(addDays(date, 1)),
      "plus-7-days": (date) => addDays(date, 7),
      "plus-30-days": (date) => addDays(date, 30),
      "start-of-month": (date) => startOfMonth(date),
      "end-of-day": (date) => endOfDay(date),
    };
    const preset = presets[value];
    if (preset) {
      handlePreset(preset);
    }
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-label={messages.dateConverter.picker.buttonLabel}
          disabled={disabled}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <CalendarDays data-icon="inline-start" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-80 overflow-hidden p-0"
        side="bottom"
        size="none"
      >
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-3 py-2.5">
            <span className="font-semibold text-sm">
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
          <Separator />

          <div className="px-3 pt-3">
            <Select onValueChange={handlePresetValue} value={null}>
              <SelectTrigger
                aria-label={messages.dateConverter.picker.presetsLabel}
                className="w-full"
                size="sm"
                variant="surface"
              >
                <SelectValue
                  placeholder={messages.dateConverter.picker.presetsLabel}
                />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="today">
                    {messages.dateConverter.picker.today}
                  </SelectItem>
                  <SelectItem value="tomorrow">
                    {messages.dateConverter.picker.tomorrow}
                  </SelectItem>
                  <SelectItem value="plus-7-days">
                    {messages.dateConverter.picker.plus7Days}
                  </SelectItem>
                  <SelectItem value="plus-30-days">
                    {messages.dateConverter.picker.plus30Days}
                  </SelectItem>
                  <SelectItem value="start-of-month">
                    {messages.dateConverter.picker.startOfMonth}
                  </SelectItem>
                  <SelectItem value="end-of-day">
                    {messages.dateConverter.picker.endOfDay}
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <Calendar
            className="w-full"
            mode="single"
            onSelect={handleSelectDay}
            selected={currentDate ?? undefined}
          />

          <Separator />
          <div className="flex flex-col gap-2.5 p-3">
            <div className="flex items-center justify-between gap-3">
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
                  className="h-8 w-10 px-1 text-center font-mono text-xs"
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(event) =>
                    updateTime(event.target.value, minutes, seconds)
                  }
                  value={hours}
                />
                <span className="text-muted-foreground text-xs">:</span>
                <Input
                  aria-label={messages.dateConverter.picker.minutes}
                  className="h-8 w-10 px-1 text-center font-mono text-xs"
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(event) =>
                    updateTime(hours, event.target.value, seconds)
                  }
                  value={minutes}
                />
                <span className="text-muted-foreground text-xs">:</span>
                <Input
                  aria-label={messages.dateConverter.picker.seconds}
                  className="h-8 w-10 px-1 text-center font-mono text-xs"
                  inputMode="numeric"
                  maxLength={2}
                  onChange={(event) =>
                    updateTime(hours, minutes, event.target.value)
                  }
                  value={seconds}
                />
              </div>
            </div>
            <div className="flex justify-end gap-1">
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
