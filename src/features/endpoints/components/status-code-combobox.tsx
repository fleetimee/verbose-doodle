import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import type { ControllerRenderProps, FieldError } from "react-hook-form";
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
import {
  HTTP_STATUS_CODES,
  STATUS_CLIENT_ERROR_MAX,
  STATUS_CLIENT_ERROR_MIN,
  STATUS_REDIRECT_MAX,
  STATUS_REDIRECT_MIN,
  STATUS_SERVER_ERROR_MIN,
  STATUS_SUCCESS_MAX,
  STATUS_SUCCESS_MIN,
} from "@/features/endpoints/constants/http-status-codes";
import { AUTO_ADVANCE_DELAY } from "@/features/endpoints/constants/stepper-steps";
import type { ResponseFormData } from "@/features/endpoints/schemas/response-schema";
import { cn } from "@/lib/utils";

type StatusCodeComboboxProps = {
  field: ControllerRenderProps<ResponseFormData, "statusCode">;
  fieldError?: FieldError;
  onSelect?: () => void;
};

export function StatusCodeCombobox({
  field,
  fieldError,
  onSelect,
}: StatusCodeComboboxProps) {
  const [open, setOpen] = useState(false);
  const selectedCode = HTTP_STATUS_CODES.find(
    (code) => code.value === field.value
  );

  const handleSelect = (value: number) => {
    field.onChange(value);
    setOpen(false);
    if (onSelect) {
      setTimeout(onSelect, AUTO_ADVANCE_DELAY);
    }
  };

  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-invalid={!!fieldError}
          className={cn(
            "h-20 w-full justify-between rounded-none border-0 border-border border-b-2 bg-transparent px-0 font-normal text-3xl shadow-none hover:bg-transparent focus:ring-0 focus-visible:border-primary aria-invalid:border-destructive md:text-4xl",
            !selectedCode && "text-muted-foreground"
          )}
          id="response-status-code"
          role="combobox"
          variant="outline"
        >
          {selectedCode ? selectedCode.label : "Select a status code"}
          <ChevronsUpDown className="ml-2 h-6 w-6 shrink-0 opacity-50 md:h-8 md:w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] p-0"
      >
        <Command>
          <CommandInput placeholder="Search status codes..." />
          <CommandList>
            <CommandEmpty>No status code found.</CommandEmpty>
            <CommandGroup heading="Success (2xx)">
              {HTTP_STATUS_CODES.filter(
                (code) =>
                  code.value >= STATUS_SUCCESS_MIN &&
                  code.value < STATUS_SUCCESS_MAX
              ).map((code) => (
                <CommandItem
                  key={code.value}
                  onSelect={() => handleSelect(code.value)}
                  value={code.label}
                >
                  {code.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      field.value === code.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Redirection (3xx)">
              {HTTP_STATUS_CODES.filter(
                (code) =>
                  code.value >= STATUS_REDIRECT_MIN &&
                  code.value < STATUS_REDIRECT_MAX
              ).map((code) => (
                <CommandItem
                  key={code.value}
                  onSelect={() => handleSelect(code.value)}
                  value={code.label}
                >
                  {code.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      field.value === code.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Client Errors (4xx)">
              {HTTP_STATUS_CODES.filter(
                (code) =>
                  code.value >= STATUS_CLIENT_ERROR_MIN &&
                  code.value < STATUS_CLIENT_ERROR_MAX
              ).map((code) => (
                <CommandItem
                  key={code.value}
                  onSelect={() => handleSelect(code.value)}
                  value={code.label}
                >
                  {code.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      field.value === code.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandGroup heading="Server Errors (5xx)">
              {HTTP_STATUS_CODES.filter(
                (code) => code.value >= STATUS_SERVER_ERROR_MIN
              ).map((code) => (
                <CommandItem
                  key={code.value}
                  onSelect={() => handleSelect(code.value)}
                  value={code.label}
                >
                  {code.label}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      field.value === code.value ? "opacity-100" : "opacity-0"
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
