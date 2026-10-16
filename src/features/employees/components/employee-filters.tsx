import { Cancel01Icon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Check, ChevronDown, SlidersHorizontal } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { fetchEmployeeFilters } from "@/features/employees/api";
import { EmployeeEmploymentFilters } from "@/features/employees/components/employee-employment-filters";
import type { EmployeeFilterOption } from "@/features/employees/types";
import { formatMessage } from "@/lib/i18n";

function FilterPicker({
  id,
  label,
  allLabel,
  options,
  value,
  disabled,
  onChange,
  portalContainer,
}: {
  id: string;
  label: string;
  allLabel: string;
  options: EmployeeFilterOption[];
  value: string;
  disabled: boolean;
  onChange: (value: string) => void;
  portalContainer?: HTMLElement | null;
}) {
  const { messages } = useI18n();
  const [open, setOpen] = useState(false);
  function select(code: string) {
    onChange(code);
    setOpen(false);
  }
  return (
    <Popover onOpenChange={setOpen} open={open}>
      <PopoverTrigger asChild>
        <Button
          aria-expanded={open}
          aria-label={label}
          className="w-full justify-between"
          disabled={disabled}
          id={id}
          role="combobox"
          size="field"
          type="button"
          variant="outline"
        >
          <span className="truncate">
            {options.find((option) => option.code === value)?.name || allLabel}
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
            aria-label={messages.employees.filterSearch}
            placeholder={messages.employees.filterSearch}
          />
          <CommandList>
            <CommandEmpty>{messages.employees.noOptions}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                keywords={[allLabel]}
                onSelect={() => select("")}
                value="all"
              >
                {allLabel}
                {value ? null : <Check className="ml-auto" />}
              </CommandItem>
              {options.map((option) => (
                <CommandItem
                  key={option.code}
                  keywords={[option.name]}
                  onSelect={() => select(option.code)}
                  value={option.code}
                >
                  <span className="min-w-0 break-words">{option.name}</span>
                  {value === option.code ? (
                    <Check className="ml-auto shrink-0" />
                  ) : null}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export function EmployeeFilters({
  activeOnly,
  includeOutsourcing,
  onEmploymentChange,
  branchCode,
  unitCode,
  onChange,
}: {
  activeOnly: boolean;
  includeOutsourcing: boolean;
  onEmploymentChange: (
    activeOnly: boolean,
    includeOutsourcing: boolean
  ) => void;
  branchCode: string;
  unitCode: string;
  onChange: (branchCode: string, unitCode: string) => void;
}) {
  const { messages } = useI18n();
  const copy = messages.employees;
  const [open, setOpen] = useState(false);
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const options = useQuery({
    queryKey: ["employees", "filters", branchCode],
    queryFn: ({ signal }) => fetchEmployeeFilters(branchCode, signal),
    placeholderData: keepPreviousData,
    gcTime: 0,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const branches = options.data?.branches ?? [];
  const units = options.data?.units ?? [];
  const count = [branchCode, unitCode, activeOnly, includeOutsourcing].filter(
    Boolean
  ).length;
  function clearFilters() {
    onChange("", "");
    onEmploymentChange(false, false);
  }
  function controls(idPrefix: string, portalContainer?: HTMLElement | null) {
    return (
      <>
        <Field className="min-w-0" size="sm">
          <FieldLabel htmlFor={`${idPrefix}-branch`}>{copy.branch}</FieldLabel>
          <FilterPicker
            allLabel={copy.allBranches}
            disabled={options.isPending || options.isError}
            id={`${idPrefix}-branch`}
            label={copy.branch}
            onChange={(code) => onChange(code, "")}
            options={branches}
            portalContainer={portalContainer}
            value={branchCode}
          />
        </Field>
        <Field className="min-w-0" size="sm">
          <FieldLabel htmlFor={`${idPrefix}-unit`}>{copy.unit}</FieldLabel>
          <FilterPicker
            allLabel={copy.allUnits}
            disabled={options.isFetching || options.isError}
            id={`${idPrefix}-unit`}
            label={copy.unit}
            onChange={(code) => onChange(branchCode, code)}
            options={units}
            portalContainer={portalContainer}
            value={unitCode}
          />
        </Field>
        <div className="flex flex-wrap items-center gap-3 md:col-span-2">
          <EmployeeEmploymentFilters
            activeOnly={activeOnly}
            includeOutsourcing={includeOutsourcing}
            onChange={onEmploymentChange}
          />
          <Button
            disabled={count === 0}
            onClick={clearFilters}
            size="xs"
            variant="ghost"
          >
            {copy.clearFilters}
          </Button>
        </div>
      </>
    );
  }
  return (
    <div className="flex shrink-0 flex-col gap-2">
      <div className="hidden grid-cols-2 gap-x-3 gap-y-2 md:grid">
        {controls("desktop")}
      </div>
      <div className="md:hidden">
        <Sheet onOpenChange={setOpen} open={open}>
          <SheetTrigger asChild>
            <Button className="w-full sm:w-auto" variant="outline">
              <SlidersHorizontal data-icon="inline-start" />
              {copy.filters}
              {count ? ` (${count})` : ""}
            </Button>
          </SheetTrigger>
          <SheetContent ref={setContainer} size="flush">
            <SheetHeader variant="muted">
              <SheetTitle>{copy.filters}</SheetTitle>
              <SheetDescription>{copy.description}</SheetDescription>
            </SheetHeader>
            <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-4">
              {controls("mobile", container)}
            </div>
            <SheetFooter variant="bordered">
              <Button className="w-full" onClick={() => setOpen(false)}>
                {copy.done}
              </Button>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </div>
      {options.isError ? (
        <Alert variant="destructive">
          <AlertDescription>
            <span>{copy.filterError}</span>
            <Button
              onClick={() => {
                options.refetch();
              }}
              size="xs"
              variant="outline"
            >
              {copy.retry}
            </Button>
          </AlertDescription>
        </Alert>
      ) : null}
      {branchCode || unitCode ? (
        <div className="flex flex-wrap items-center gap-2">
          {branchCode ? (
            <Badge
              aria-label={formatMessage(copy.removeFilter, {
                filter: copy.branch,
              })}
              onClick={() => onChange("", "")}
              radius="rounded"
              render={<Button size="xs" type="button" variant="secondary" />}
            >
              <span className="max-w-40 truncate">
                {branches.find((branch) => branch.code === branchCode)?.name ||
                  branchCode}
              </span>
              <HugeiconsIcon
                data-icon="inline-end"
                icon={Cancel01Icon}
                strokeWidth={2}
              />
            </Badge>
          ) : null}
          {unitCode ? (
            <Badge
              aria-label={formatMessage(copy.removeFilter, {
                filter: copy.unit,
              })}
              onClick={() => onChange(branchCode, "")}
              radius="rounded"
              render={<Button size="xs" type="button" variant="secondary" />}
            >
              <span className="max-w-40 truncate">
                {units.find((unit) => unit.code === unitCode)?.name || unitCode}
              </span>
              <HugeiconsIcon
                data-icon="inline-end"
                icon={Cancel01Icon}
                strokeWidth={2}
              />
            </Badge>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
