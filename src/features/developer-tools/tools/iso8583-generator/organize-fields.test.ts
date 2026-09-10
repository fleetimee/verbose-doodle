import { expect, test } from "bun:test";
import { organizeIso8583Fields } from "./organize-fields";
import type { Iso8583Field } from "./pack-iso8583";

const fields: readonly Iso8583Field[] = [
  {
    number: 70,
    label: "Network code",
    kind: "n",
    length: 3,
    enabled: true,
    value: "001",
  },
  {
    number: 4,
    label: "Amount",
    kind: "n",
    length: 12,
    enabled: true,
    value: "000000010000",
  },
  {
    number: 7,
    label: "Transmission time",
    kind: "n",
    length: 10,
    enabled: false,
    value: "0901080037",
  },
  {
    number: 120,
    label: "Private extension",
    kind: "lllvar",
    length: 999,
    enabled: true,
    value: "test",
  },
  {
    number: 125,
    label: "Hidden tail",
    kind: "lllvar",
    length: 999,
    enabled: true,
    value: "tail",
    hidden: true,
  },
];
const defaults = {
  search: "",
  grouping: "none",
  sort: "bit-asc",
  filter: "all",
} as const;

test("sorts visible fields without mutating protocol data", () => {
  const before = JSON.stringify(fields);
  expect(
    organizeIso8583Fields(fields, defaults)[0].fields.map(
      (field) => field.number
    )
  ).toEqual([4, 7, 70, 120]);
  expect(
    organizeIso8583Fields(fields, {
      ...defaults,
      sort: "name-desc",
    })[0].fields.map((field) => field.number)
  ).toEqual([7, 120, 70, 4]);
  expect(JSON.stringify(fields)).toBe(before);
});

test("groups category fallbacks and bit ranges without dropping visible fields", () => {
  const categories = organizeIso8583Fields(fields, {
    ...defaults,
    grouping: "category",
  });
  expect(
    categories.find((group) => group.key === "private")?.fields[0].number
  ).toBe(120);
  expect(categories.flatMap((group) => group.fields)).toHaveLength(4);
  const ranges = organizeIso8583Fields(fields, {
    ...defaults,
    grouping: "bit-range",
  });
  expect(ranges.map((group) => group.key)).toEqual(["1", "65", "113"]);
});

test("combines case-insensitive search and enabled state filtering", () => {
  expect(
    organizeIso8583Fields(fields, {
      ...defaults,
      search: " TRANSMISSION ",
      filter: "disabled",
    })[0].fields[0].number
  ).toBe(7);
  expect(
    organizeIso8583Fields(fields, {
      ...defaults,
      search: "bit 7",
      filter: "disabled",
    })[0].fields[0].number
  ).toBe(7);
  expect(
    organizeIso8583Fields(fields, {
      ...defaults,
      search: "Transmission",
      filter: "enabled",
    })
  ).toEqual([]);
});
