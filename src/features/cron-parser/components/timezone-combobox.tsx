import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatMessage, messages } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type TimezoneComboboxProps = {
  readonly onChange: (timeZone: string) => void;
  readonly options: readonly string[];
  readonly value: string;
};

export function TimezoneCombobox({
  onChange,
  options,
  value,
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectTimeZone = (timeZone: string) => {
    onChange(timeZone);
    setQuery("");
    setOpen(false);
  };

  const canUseQuery = (() => {
    if (!query.trim()) {
      return false;
    }
    try {
      new Intl.DateTimeFormat("en-US", { timeZone: query.trim() }).format();
      return true;
    } catch {
      return false;
    }
  })();

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between rounded-md bg-background font-mono font-normal shadow-none"
          id="cron-timezone"
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">{value}</span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-45" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--anchor-width)] p-0">
        <Command>
          <CommandInput
            onValueChange={setQuery}
            placeholder={messages.cronParser.timezoneSearch}
            value={query}
          />
          <CommandList>
            <CommandEmpty>
              {canUseQuery ? (
                <button
                  className="w-full px-3 py-2 text-left font-mono text-xs hover:bg-accent"
                  onClick={() => selectTimeZone(query.trim())}
                  type="button"
                >
                  {formatMessage(messages.cronParser.timezoneUse, {
                    timezone: query.trim(),
                  })}
                </button>
              ) : (
                messages.cronParser.timezoneEmpty
              )}
            </CommandEmpty>
            <CommandGroup>
              {options.map((timeZone) => (
                <CommandItem
                  key={timeZone}
                  onSelect={() => selectTimeZone(timeZone)}
                  value={timeZone}
                >
                  <span className="font-mono text-xs">{timeZone}</span>
                  <Check
                    className={cn(
                      "ml-auto size-4",
                      value === timeZone ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
