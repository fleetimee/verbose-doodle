import { useState } from "react";
import { ChevronDown } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  inputRef: (element: HTMLInputElement | null) => void;
  hosts: string[];
  disabled: boolean;
  invalid: boolean;
  portalContainer: HTMLElement | null;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <div className="flex items-center gap-2">
        <Input
          aria-describedby="server-host-description"
          aria-invalid={invalid}
          autoComplete="off"
          disabled={disabled}
          id="server-host"
          onBlur={onBlur}
          onChange={(event) => onChange(event.target.value)}
          placeholder={messages.servers.hostPlaceholder}
          ref={inputRef}
          value={value}
        />
        <PopoverTrigger asChild>
          <button
            aria-label={messages.servers.hostDescription}
            className="flex size-9 shrink-0 items-center justify-center rounded-md border border-input hover:bg-accent focus-visible:outline-2 focus-visible:outline-ring"
            disabled={disabled}
            type="button"
          >
            <ChevronDown className="size-4" />
          </button>
        </PopoverTrigger>
      </div>
      <PopoverContent
        align="end"
        className="w-72"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            event.stopPropagation();
            setOpen(false);
          }
        }}
        portalContainer={portalContainer}
        size="none"
      >
        <div
          aria-label={messages.servers.host}
          className="max-h-60 overflow-y-auto p-1"
          role="listbox"
        >
          {hosts.map((host) => (
            <button
              aria-selected={value === host}
              className="flex w-full rounded-sm px-3 py-2 text-left font-mono text-sm hover:bg-accent focus-visible:bg-accent focus-visible:outline-none"
              key={host}
              onClick={() => {
                onChange(host);
                setOpen(false);
              }}
              role="option"
              type="button"
            >
              {host}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}
