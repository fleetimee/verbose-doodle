import { expect, test } from "bun:test";
import {
  createQris,
  QRIS_CREATOR_SAMPLE,
} from "@/features/developer-tools/tools/qris-creator/create-qris";
import { importQris } from "@/features/developer-tools/tools/qris-creator/import-qris";
import {
  calculateQrisCrc,
  parseQris,
} from "@/features/developer-tools/tools/qris-parser/parse-qris";

function providerPayload() {
  const source =
    createQris({ ...QRIS_CREATOR_SAMPLE, mode: "dynamic", reference: "INV-42" })
      .payload ?? "";
  const fields = parseQris(source).fields.filter((field) => field.id !== "63");
  const body = `${fields
    .map((field) => {
      if (field.id === "26") {
        const value = `${field.value}0406SECRET`;
        return `29${String(value.length).padStart(2, "0")}${value}`;
      }
      if (field.id === "62") {
        const value = `${field.value}0104BILL`;
        return `62${String(value.length).padStart(2, "0")}${value}`;
      }
      return `${field.id}${String(field.length).padStart(2, "0")}${field.value}`;
    })
    .join("")}55020180110007OPAQUE16304`;
  return body + calculateQrisCrc(body);
}

test("imports without loss and retains unknown provider data across edits", () => {
  const payload = providerPayload();
  const imported = importQris(payload);
  expect(imported.accountTag).toBe("29");
  expect(imported.input.reference).toBe("INV-42");
  expect(createQris(imported.input, imported).payload).toBe(payload);
  const result = createQris(
    {
      ...imported.input,
      amount: "25000",
      merchantName: "EDITED SHOP",
      reference: "NEW-REF",
    },
    imported
  );
  const parsed = parseQris(result.payload ?? "");
  expect(parsed.crcValid).toBe(true);
  expect(parsed.amount).toBe("25000");
  expect(parsed.merchant).toBe("EDITED SHOP");
  expect(
    parsed.fields
      .find((field) => field.id === "29")
      ?.children.find((field) => field.id === "04")?.value
  ).toBe("SECRET");
  expect(
    parsed.fields
      .find((field) => field.id === "62")
      ?.children.find((field) => field.id === "01")?.value
  ).toBe("BILL");
  expect(parsed.fields.find((field) => field.id === "80")?.value).toBe(
    "0007OPAQUE1"
  );
  expect(parsed.fields.find((field) => field.id === "55")?.value).toBe("01");
  expect(parsed.fields.some((field) => field.id === "26")).toBe(false);
});

test("rejects damaged and non-QRIS payloads", () => {
  const payload = providerPayload();
  expect(() => importQris(`${payload.slice(0, -4)}0000`)).toThrow();
  expect(() => importQris("https://example.com")).toThrow();
});

test("switching imported static to dynamic requires an amount", () => {
  const imported = importQris(createQris(QRIS_CREATOR_SAMPLE).payload ?? "");
  expect(
    createQris({ ...imported.input, mode: "dynamic" }, imported).errors.amount
  ).toBe("required");
});

test("removes dynamic amount when switching to static and detects expanded template limits", () => {
  const imported = importQris(providerPayload());
  const result = createQris({ ...imported.input, mode: "static" }, imported);
  expect(parseQris(result.payload ?? "").amount).toBeUndefined();
  expect(
    createQris(
      {
        ...imported.input,
        providerGuid: "A".repeat(32),
        merchantId: "B".repeat(25),
      },
      imported
    ).errors.providerGuid
  ).toBe("templateLength");
});

test("preserves whitespace and non-ASCII provider fields on an unchanged import", () => {
  const payload = providerPayload();
  const body =
    payload.slice(0, -8).replace("5913DEMO MERCHANT", "5915 DEMO MERCHANT ") +
    "64070003東京店6304";
  const source = body + calculateQrisCrc(body);
  const imported = importQris(source);
  expect(createQris(imported.input, imported).payload).toBe(source);
});
