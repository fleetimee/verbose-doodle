import { Tick02Icon, UnfoldMoreIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
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
import { isValidTimeZone } from "@/features/developer-tools/timezones";
import { cn } from "@/lib/utils";

type TimezoneComboboxProps = {
  readonly emptyMessage: string;
  readonly id: string;
  readonly onChange: (timeZone: string) => void;
  readonly options: readonly string[];
  readonly searchPlaceholder: string;
  readonly useQueryLabel: (timeZone: string) => string;
  readonly value: string;
};

export function TimezoneCombobox({
  emptyMessage,
  id,
  onChange,
  options,
  searchPlaceholder,
  useQueryLabel,
  value,
}: TimezoneComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const selectTimeZone = (timeZone: string) => {
    onChange(timeZone);
    setQuery("");
    setOpen(false);
  };

  const normalizedQuery = query.trim();
  const canUseQuery =
    Boolean(normalizedQuery) && isValidTimeZone(normalizedQuery);

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          className="w-full justify-between rounded-md bg-background font-mono font-normal shadow-none"
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">{value}</span>
          <HugeiconsIcon
            className="size-4 shrink-0 opacity-45"
            icon={UnfoldMoreIcon}
            strokeWidth={2}
          />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-[var(--anchor-width)] p-0">
        <Command>
          <CommandInput
            onValueChange={setQuery}
            placeholder={searchPlaceholder}
            value={query}
          />
          <CommandList>
            <CommandEmpty>
              {canUseQuery ? (
                <button
                  className="w-full px-3 py-2 text-left font-mono text-xs hover:bg-accent"
                  onClick={() => selectTimeZone(normalizedQuery)}
                  type="button"
                >
                  {useQueryLabel(normalizedQuery)}
                </button>
              ) : (
                emptyMessage
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
                  <HugeiconsIcon
                    className={cn(
                      "ml-auto size-4",
                      value === timeZone ? "opacity-100" : "opacity-0"
                    )}
                    icon={Tick02Icon}
                    strokeWidth={2}
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
