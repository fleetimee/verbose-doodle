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

export function ServerHostPicker({
  value,
  onChange,
  onBlur,
  inputRef,
  hosts,
  disabled,
  invalid,
  portalContainer,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  inputRef: (element: HTMLButtonElement | null) => void;
  hosts: string[];
  disabled: boolean;
  invalid: boolean;
  portalContainer: HTMLElement | null;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const options = [...new Set([...hosts, value].filter(Boolean))].sort();
  const custom = search.trim();
  const select = (host: string) => {
    onChange(host);
    onBlur();
    setOpen(false);
    setSearch("");
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-describedby="server-host-description"
          aria-expanded={open}
          aria-invalid={invalid}
          className="w-full justify-between"
          disabled={disabled}
          id="server-host"
          onBlur={onBlur}
          ref={inputRef}
          role="combobox"
          type="button"
          variant="outline"
        >
          <span className="truncate">
            {value || messages.servers.hostPlaceholder}
          </span>
          <ChevronDown data-icon="inline-end" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-(--anchor-width)"
        portalContainer={portalContainer}
        size="none"
      >
        <Command>
          <CommandInput
            aria-label={messages.servers.hostSearch}
            onValueChange={setSearch}
            placeholder={messages.servers.hostSearch}
            value={search}
          />
          <CommandList>
            <CommandGroup>
              {options.map((host) => (
                <CommandItem
                  key={host}
                  onSelect={() => select(host)}
                  value={host}
                >
                  {host}
                  {value === host && <Check className="ml-auto" />}
                </CommandItem>
              ))}
              {custom && !options.includes(custom) && (
                <CommandItem onSelect={() => select(custom)} value={custom}>
                  <Plus />
                  {formatMessage(messages.servers.useHost, { host: custom })}
                </CommandItem>
              )}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
