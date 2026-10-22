import { format, parseISO } from "date-fns";
import { enUS, id } from "date-fns/locale";
import { useState } from "react";
import { CalendarDays, ChevronDown } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarPicker } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

export function LogDatePicker({
  value,
  onChange,
  label,
  id: inputId,
  min,
  max,
  optional = false,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id: string;
  min?: string;
  max?: string;
  optional?: boolean;
}) {
  const { locale, messages } = useI18n();
  const [open, setOpen] = useState(false);
  const dateLocale = locale === "id-ID" ? id : enUS;
  const selected = value ? parseISO(value) : undefined;
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger
        render={
          <Button
            className="w-full justify-between"
            id={inputId}
            variant="outline"
          />
        }
      >
        <span className="flex min-w-0 items-center gap-2">
          <CalendarDays data-icon="inline-start" />
          <span className="truncate">
            {selected
              ? format(selected, "dd MMM yyyy", { locale: dateLocale })
              : messages.logViewer.today}
          </span>
        </span>
        <span className="sr-only">{label}</span>
        <ChevronDown data-icon="inline-end" />
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width)" size="none">
        <CalendarPicker
          captionLayout="dropdown"
          classNames={{ root: "w-full" }}
          defaultMonth={selected}
          disabled={(date) =>
            (min ? date < parseISO(min) : false) ||
            (max ? date > parseISO(max) : false)
          }
          locale={dateLocale}
          mode="single"
          onSelect={(date) => {
            if (date) {
              onChange(format(date, "yyyy-MM-dd"));
              setOpen(false);
            }
          }}
          selected={selected}
        />
        {optional && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                className="w-full"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                size="sm"
                variant="ghost"
              >
                {messages.logViewer.useToday}
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}
