import { describe, expect, test } from "bun:test";
import { formatIso8583FieldValue } from "./format-field-value";
import type { Iso8583Field } from "./pack-iso8583";

function field(number: number, value: string, enabled = true): Iso8583Field {
  return {
    number,
    value,
    enabled,
    kind: "n",
    length: value.length,
    label: "Test field",
  };
}

describe("readable ISO field values", () => {
  test("formats dates and times without inventing a year or timezone", () => {
    expect(formatIso8583FieldValue(field(7, "0901080037"), [])).toBe(
      "September 1, 08:00:37"
    );
    expect(formatIso8583FieldValue(field(12, "235959"), [])).toBe("23:59:59");
    expect(formatIso8583FieldValue(field(13, "0229"), [])).toBe("February 29");
    expect(formatIso8583FieldValue(field(14, "2912"), [])).toBe("December '29");
  });
  test.each([
    [7, "0901240037"],
    [7, "0230080037"],
    [12, "126000"],
    [12, "120060"],
    [13, "0001"],
    [13, "0100"],
    [14, "2913"],
    [7, "0901"],
    [4, "abc"],
  ])("does not interpret invalid bit %s value %s", (number, value) => {
    expect(
      formatIso8583FieldValue(field(Number(number), String(value)), [])
    ).toBeUndefined();
  });
  test("uses the profile's IDR units and the selected currency precision", () => {
    const amount = field(4, "000000010000");
    expect(formatIso8583FieldValue(amount, [field(49, "360")])).toBe(
      "IDR\u00a010,000"
    );
    expect(formatIso8583FieldValue(amount, [field(49, "840")])).toBe(
      "USD\u00a0100.00"
    );
    expect(formatIso8583FieldValue(amount, [field(49, "392")])).toBe(
      "JPY\u00a010,000"
    );
    expect(
      formatIso8583FieldValue(field(4, "000000000000"), [field(49, "360")])
    ).toBe("IDR\u00a00");
  });
  test("does not guess missing, disabled, or unknown currencies", () => {
    const amount = field(4, "000000010000");
    expect(formatIso8583FieldValue(amount, [])).toBeUndefined();
    expect(
      formatIso8583FieldValue(amount, [field(49, "360", false)])
    ).toBeUndefined();
    expect(formatIso8583FieldValue(amount, [field(49, "999")])).toBeUndefined();
    expect(
      formatIso8583FieldValue(field(7, "0901080037", false), [])
    ).toBeUndefined();
  });
});
