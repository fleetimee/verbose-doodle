import { type ReactNode, useEffect, useState } from "react";
import {
  Banknote,
  Building2,
  CalendarClock,
  ChevronDown,
  CreditCard,
  FileText,
  Hash,
  type HugeIcon,
  Layers3,
  Network,
  ShieldCheck,
  TextCursor,
} from "@/components/hugeicons";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Field, FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatMessage, messages } from "@/lib/i18n";
import {
  type FieldFilter,
  type FieldGrouping,
  type FieldSort,
  organizeIso8583Fields,
} from "../organize-fields";
import type { Iso8583Field, Iso8583PackingError } from "../pack-iso8583";

const copy = messages.iso8583Generator;
const CATEGORY_ICONS: Readonly<
  Record<keyof typeof copy.fieldCategories, HugeIcon>
> = {
  transaction: FileText,
  amounts: Banknote,
  dates: CalendarClock,
  accounts: CreditCard,
  merchant: Building2,
  network: Network,
  security: ShieldCheck,
  private: Layers3,
};

function GroupIcon({
  groupKey,
  grouping,
}: {
  readonly groupKey: string;
  readonly grouping: FieldGrouping;
}) {
  if (grouping === "category") {
    // SAFETY: groupKey is a category key when grouping by category.
    const Icon = CATEGORY_ICONS[groupKey as keyof typeof CATEGORY_ICONS];
    return (
      <Icon
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground"
      />
    );
  }
  const Icon = grouping === "bit-range" ? Hash : TextCursor;
  return (
    <Icon
      aria-hidden="true"
      className="size-4 shrink-0 text-muted-foreground"
    />
  );
}
const GROUPS = {
  none: copy.noGrouping,
  category: copy.groupCategory,
  "bit-range": copy.groupBitRange,
  name: copy.groupName,
};
const SORTS = {
  "bit-asc": copy.sortBitAsc,
  "bit-desc": copy.sortBitDesc,
  "name-asc": copy.sortNameAsc,
  "name-desc": copy.sortNameDesc,
};
const FILTERS = {
  all: copy.allFields,
  enabled: copy.enabledFields,
  disabled: copy.disabledFields,
};

function ViewSelect({
  id,
  label,
  value,
  options,
  onChange,
}: {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly options: Readonly<Record<string, string>>;
  readonly onChange: (value: string) => void;
}) {
  return (
    <Field size="sm">
      <Label htmlFor={id}>{label}</Label>
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full" id={id}>
          <SelectValue>{options[value]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {Object.entries(options).map(([key, text]) => (
              <SelectItem key={key} value={key}>
                {text}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </Field>
  );
}

function groupLabel(key: string, grouping: FieldGrouping) {
  if (grouping === "category") {
    // SAFETY: key is a field-category key when grouping by category.
    return copy.fieldCategories[key as keyof typeof copy.fieldCategories];
  }
  if (grouping === "bit-range") {
    return formatMessage(copy.bitRangeLabel, {
      start: key,
      end: Number(key) + 15,
    });
  }
  return key;
}

export function Iso8583FieldBrowser({
  fields,
  error,
  renderField,
}: {
  readonly fields: readonly Iso8583Field[];
  readonly error: Iso8583PackingError | null;
  readonly renderField: (field: Iso8583Field, index: number) => ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [grouping, setGrouping] = useState<FieldGrouping>("none");
  const [sort, setSort] = useState<FieldSort>("bit-asc");
  const [filter, setFilter] = useState<FieldFilter>("all");
  const [collapsed, setCollapsed] = useState<string[]>([]);
  const [focusNumber, setFocusNumber] = useState<number | null>(null);
  const groups = organizeIso8583Fields(fields, {
    search,
    grouping,
    sort,
    filter,
  });
  const shown = groups.reduce((count, group) => count + group.fields.length, 0);
  const total = fields.filter((field) => !field.hidden).length;
  const clearFilters = () => {
    setSearch("");
    setFilter("all");
  };

  useEffect(() => {
    if (focusNumber === null) {
      return;
    }
    document.getElementById(`iso-field-${focusNumber}`)?.focus();
    setFocusNumber(null);
  }, [focusNumber]);

  return (
    <>
      <div className="flex flex-col gap-2 border-b bg-muted/10 px-4 py-3">
        <FieldGroup
          className="grid sm:grid-cols-2 lg:grid-cols-[minmax(180px,1.5fr)_repeat(3,minmax(0,1fr))]"
          size="sm"
        >
          <Field size="sm">
            <Label htmlFor="iso-field-search">{copy.fieldSearch}</Label>
            <Input
              id="iso-field-search"
              onChange={(event) => setSearch(event.currentTarget.value)}
              placeholder={copy.fieldSearchPlaceholder}
              value={search}
            />
          </Field>
          <ViewSelect
            id="iso-field-group"
            label={copy.groupBy}
            onChange={(value) => {
              // SAFETY: The select options are the supported field groupings.
              setGrouping(value as FieldGrouping);
              setCollapsed([]);
            }}
            options={GROUPS}
            value={grouping}
          />
          <ViewSelect
            id="iso-field-sort"
            label={copy.sortBy}
            onChange={(value) =>
              // SAFETY: The select options are the supported field sort modes.
              setSort(value as FieldSort)
            }
            options={SORTS}
            value={sort}
          />
          <ViewSelect
            id="iso-field-filter"
            label={copy.fieldFilter}
            onChange={(value) =>
              // SAFETY: The select options are the supported field filters.
              setFilter(value as FieldFilter)
            }
            options={FILTERS}
            value={filter}
          />
        </FieldGroup>
        <div className="flex items-center justify-between gap-3">
          <p className="text-muted-foreground text-xs" role="status">
            {formatMessage(copy.shownFields, { shown, total })}
          </p>
          <Button
            disabled={!search && filter === "all"}
            onClick={clearFilters}
            size="sm-compact"
            type="button"
            variant="ghost"
          >
            {copy.clearFieldFilters}
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-4 p-4">
        {shown === 0 ? (
          <p className="py-6 text-center text-muted-foreground text-sm">
            {copy.noMatchingFields}
          </p>
        ) : null}
        {groups.map((group) => {
          const grid = (
            <FieldGroup
              className="grid gap-x-5 gap-y-4 sm:grid-cols-2"
              size="compact"
            >
              {group.fields.map(renderField)}
            </FieldGroup>
          );
          if (grouping === "none") {
            return <div key={group.key}>{grid}</div>;
          }
          const open = !collapsed.includes(group.key);
          return (
            <Collapsible
              key={group.key}
              onOpenChange={(nextOpen) =>
                setCollapsed((current) =>
                  nextOpen
                    ? current.filter((key) => key !== group.key)
                    : [...current, group.key]
                )
              }
              open={open}
            >
              <h3>
                <CollapsibleTrigger variant="header">
                  <span className="flex min-w-0 items-center gap-2.5">
                    <GroupIcon grouping={grouping} groupKey={group.key} />
                    {groupLabel(group.key, grouping)}{" "}
                    <span className="font-mono text-muted-foreground text-xs">
                      {group.fields.length}
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-2 text-muted-foreground text-xs">
                    {open ? copy.collapseGroup : copy.expandGroup}
                    <ChevronDown
                      aria-hidden="true"
                      className="size-4 transition-transform duration-150 data-[open=false]:-rotate-90 motion-reduce:transition-none"
                      data-open={open}
                    />
                  </span>
                </CollapsibleTrigger>
              </h3>
              <CollapsibleContent>
                <div className="pt-3">{grid}</div>
              </CollapsibleContent>
            </Collapsible>
          );
        })}
      </div>
      {error ? (
        <div
          className="mx-4 mb-4 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-destructive text-xs"
          role="alert"
        >
          {error.message || copy.packErrorMessageFallback}
          {error.fieldNumber ? (
            <Button
              onClick={() => {
                clearFilters();
                setCollapsed([]);
                setFocusNumber(error.fieldNumber ?? null);
              }}
              size="sm-compact"
              type="button"
              variant="link"
            >
              {copy.goToInvalidField}
            </Button>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
