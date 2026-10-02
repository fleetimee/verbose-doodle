import { useState } from "react";
import { Check, ChevronDown, Plus } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import {
  Command,
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
import { formatMessage } from "@/lib/i18n";

export function AccessTypePicker({
  id,
  invalid,
  disabled,
  value,
  types,
  onChange,
}: {
  id: string;
  invalid: boolean;
  disabled: boolean;
  value: string;
  types: string[];
  onChange: (value: string) => void;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = [
    ...new Set(
      ["SSH", "RDP", "WEB", "DATABASE", ...types, value].filter(Boolean)
    ),
  ].sort();
  const custom = search.trim().toUpperCase();
  const select = (type: string) => {
    onChange(type);
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={invalid}
          className="w-full justify-between"
          disabled={disabled}
          id={id}
          role="combobox"
          type="button"
          variant="outline"
        >
          {value || messages.servers.chooseType}
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-(--anchor-width)" size="none">
        <Command>
          <CommandInput
            aria-label={messages.servers.typeSearch}
            maxLength={50}
            onValueChange={setSearch}
            placeholder={messages.servers.typeSearch}
            value={search}
          />
          <CommandList>
            <CommandGroup>
              {options.map((type) => (
                <CommandItem
                  key={type}
                  onSelect={() => select(type)}
                  value={type}
                >
                  {type}
                  {value === type && <Check className="ml-auto" />}
                </CommandItem>
              ))}
              {custom && !options.includes(custom) && (
                <CommandItem onSelect={() => select(custom)} value={custom}>
                  <Plus />
                  {formatMessage(messages.servers.createType, { type: custom })}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
