import { DEFAULT_LOCALE, type messages } from "@/lib/i18n";
import type { Iso8583Field } from "./pack-iso8583";

export type FieldGrouping = "none" | "category" | "bit-range" | "name";
export type FieldSort = "bit-asc" | "bit-desc" | "name-asc" | "name-desc";
export type FieldFilter = "all" | "enabled" | "disabled";
type Category = keyof typeof messages.iso8583Generator.fieldCategories;

const CATEGORY_BITS: Readonly<Record<Category, readonly number[]>> = {
  transaction: [3, 11, 37, 38, 39, 90],
  amounts: [4, 5, 6, 9, 10, 28, 29, 30, 31, 49, 50, 51, 54],
  dates: [7, 12, 13, 14, 15, 16, 17],
  accounts: [2, 23, 35, 45, 102, 103],
  merchant: [18, 22, 25, 26, 41, 42, 43],
  network: [24, 32, 33, 70, 100],
  security: [52, 53, 55, 64, 96, 128],
  private: [],
};

export function fieldCategory(number: number): Category {
  return (
    (Object.keys(CATEGORY_BITS) as Category[]).find((key) =>
      CATEGORY_BITS[key].includes(number)
    ) ?? "private"
  );
}

function groupKey(field: Iso8583Field, grouping: FieldGrouping) {
  switch (grouping) {
    case "category":
      return fieldCategory(field.number);
    case "bit-range":
      return String(Math.floor((field.number - 1) / 16) * 16 + 1);
    case "name":
      return field.label.charAt(0).toLocaleUpperCase(DEFAULT_LOCALE);
    default:
      return "all";
  }
}

export function organizeIso8583Fields(
  fields: readonly Iso8583Field[],
  options: {
    search: string;
    grouping: FieldGrouping;
    sort: FieldSort;
    filter: FieldFilter;
  }
) {
  const query = options.search.trim().toLocaleLowerCase(DEFAULT_LOCALE);
  const filtered = fields.filter((field) => {
    if (field.hidden) {
      return false;
    }
    if (options.filter === "enabled" && !field.enabled) {
      return false;
    }
    if (options.filter === "disabled" && field.enabled) {
      return false;
    }
    return `${String(field.number).padStart(2, "0")} bit ${field.number} ${field.label}`
      .toLocaleLowerCase(DEFAULT_LOCALE)
      .includes(query);
  });
  const direction = options.sort.endsWith("desc") ? -1 : 1;
  filtered.sort((a, b) => {
    const difference = options.sort.startsWith("name")
      ? a.label.localeCompare(b.label, DEFAULT_LOCALE)
      : a.number - b.number;
    return direction * (difference || a.number - b.number);
  });
  const groups = new Map<string, Iso8583Field[]>();
  for (const field of filtered) {
    const key = groupKey(field, options.grouping);
    const group = groups.get(key) ?? [];
    group.push(field);
    groups.set(key, group);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b, DEFAULT_LOCALE, { numeric: true }))
    .map(([key, items]) => ({ key, fields: items }));
}
