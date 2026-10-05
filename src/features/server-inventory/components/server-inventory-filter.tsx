import { useState } from "react";
import { Check, ChevronDown, ListFilter } from "@/components/hugeicons";
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
import { ServerAccessIcon } from "@/features/server-inventory/components/server-access-icon";

export function ServerInventoryFilter({
  label,
  allLabel,
  emptyLabel,
  value,
  options,
  engine = false,
  onChange,
}: {
  label: string;
  allLabel: string;
  emptyLabel: string;
  value: string;
  options: string[];
  engine?: boolean;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const select = (next: string) => {
    onChange(next);
    setOpen(false);
  };
  const icon = (option: string) => {
    if (engine) {
      return (
        <ServerAccessIcon
          accessType="DATABASE"
          databaseEngine={option}
          decorative
          engineOnly
        />
      );
    }
    if (option) {
      return <ServerAccessIcon accessType={option} decorative />;
    }
    return <ListFilter aria-hidden="true" />;
  };
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={label}
          className="inventory-filter min-w-0 max-w-full"
          data-active={!!value}
          role="combobox"
          variant="outline"
        >
          <span className="flex min-w-0 items-center gap-2">
            {icon(value)}
            <span className="truncate">{value || allLabel}</span>
          </span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width) min-w-64"
        size="none"
      >
        <Command>
          <CommandInput aria-label={label} placeholder={label} />
          <CommandList>
            <CommandEmpty>{emptyLabel}</CommandEmpty>
            <CommandGroup>
              <CommandItem onSelect={() => select("")} value={allLabel}>
                {icon("")}
                <span>{allLabel}</span>
                {!value && <Check className="ml-auto" />}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option}
                  onSelect={() => select(option)}
                  value={option}
                >
                  {icon(option)}
                  <span>{option}</span>
                  {value === option && <Check className="ml-auto" />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
