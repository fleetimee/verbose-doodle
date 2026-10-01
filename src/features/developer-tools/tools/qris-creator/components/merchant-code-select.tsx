import { UnfoldMoreIcon } from "@hugeicons/core-free-icons";
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
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { QRIS_MERCHANT_CRITERIA } from "@/features/developer-tools/tools/qris-creator/create-qris";
import { messages } from "@/lib/i18n";

// Common categories from Visa Merchant Data Standards Manual (April 2026).
// https://usa.visa.com/dam/VCOM/download/merchants/visa-merchant-data-standards-manual.pdf
const CATEGORIES = [
  ["5411", "Groceries / supermarkets"],
  ["5462", "Bakeries"],
  ["5499", "Convenience / specialty food shops"],
  ["5541", "Fuel stations"],
  ["5811", "Catering"],
  ["5812", "Restaurants"],
  ["5814", "Fast food"],
  ["5661", "Footwear shops"],
  ["5691", "Adult clothing shops"],
  ["5699", "Other apparel / accessories"],
  ["5912", "Pharmacies"],
  ["5942", "Bookshops"],
  ["7230", "Hair / beauty salons"],
  ["8211", "Primary / secondary schools"],
  ["8220", "Higher education"],
  ["8299", "Other educational services"],
  ["8351", "Childcare"],
] as const;
const CODE = /^\d{4}$/;
const CRITERIA = /^[A-Za-z0-9]{3}$/;

export function MerchantCodeSelect({
  kind,
  id,
  value,
  onChange,
  invalid,
  describedBy,
  disabled = false,
}: {
  readonly kind: "merchantCriteria" | "merchantCategoryCode";
  readonly id: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly invalid: boolean;
  readonly describedBy?: string;
  readonly disabled?: boolean;
}) {
  const copy = messages.developerTools.qrisCreator;
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const options =
    kind === "merchantCriteria"
      ? QRIS_MERCHANT_CRITERIA.map(
          (code) => [code, copy.criteriaLabels[code]] as const
        )
      : CATEGORIES;
  const isCriteria = kind === "merchantCriteria";
  const label = options.find(([code]) => code === value)?.[1];
  const custom = query.trim();
  const placeholder = isCriteria ? copy.chooseCriteria : copy.chooseMcc;
  function choose(code: string) {
    onChange(code);
    setOpen(false);
    setQuery("");
  }
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      {!isCriteria && (
        <Input
          aria-describedby={describedBy}
          aria-invalid={invalid}
          className="min-w-0 flex-1"
          disabled={disabled}
          id={id}
          inputMode="numeric"
          maxLength={4}
          onChange={(event) => onChange(event.target.value)}
          placeholder="5812"
          size="sm"
          value={value}
          variant="muted-mono"
        />
      )}
      <Popover onOpenChange={setOpen} open={open}>
        <PopoverTrigger asChild>
          <Button
            aria-describedby={describedBy}
            aria-expanded={open}
            aria-invalid={invalid}
            aria-label={isCriteria ? undefined : copy.chooseMcc}
            className={isCriteria ? "w-full justify-between" : "shrink-0"}
            disabled={disabled}
            id={isCriteria ? id : undefined}
            role="combobox"
            size="sm"
            variant="mono-flat"
          >
            {isCriteria && (
              <span className="truncate">
                {value ? `${value}${label ? ` · ${label}` : ""}` : placeholder}
              </span>
            )}
            <HugeiconsIcon
              className="size-3.5 shrink-0 text-muted-foreground"
              icon={UnfoldMoreIcon}
              strokeWidth={2}
            />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="w-[var(--anchor-width)] min-w-64"
          size="none"
        >
          <Command>
            <CommandInput
              onValueChange={setQuery}
              placeholder={isCriteria ? copy.searchCriteria : copy.searchMcc}
              value={query}
            />
            <CommandList>
              {(isCriteria ? CRITERIA : CODE).test(custom) && (
                <CommandGroup forceMount>
                  <CommandItem
                    forceMount
                    onSelect={() => choose(custom)}
                    value={`manual ${custom}`}
                  >
                    {copy.useCode} · {custom}
                  </CommandItem>
                </CommandGroup>
              )}

              <CommandEmpty>{copy.noCodes}</CommandEmpty>
              <CommandGroup>
                {options.map(([code, name]) => (
                  <CommandItem
                    key={code}
                    onSelect={() => choose(code)}
                    value={`${code} ${name}`}
                  >
                    <span className="font-mono">{code}</span>
                    <span>{name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
