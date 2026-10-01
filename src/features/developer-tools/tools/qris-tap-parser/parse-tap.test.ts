import { expect, test } from "bun:test";
import { parseCpm } from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";
import {
  formatTapTree,
  inspectTap,
  parseTap,
  TAP_SAMPLE,
  TAP_SAMPLE_HEX,
} from "@/features/developer-tools/tools/qris-tap-parser/parse-tap";

test("matches the Android inspection fixture and recurses on the constructed bit", () => {
  const result = parseTap("4QtaAwECA58aAwQFBg==", "auto");
  expect(parseTap(TAP_SAMPLE, "auto")).toEqual(parseTap(TAP_SAMPLE_HEX, "hex"));
  expect(result.tlv[0].tag).toBe("E1");
  expect(result.tlv[0].children?.map((node) => node.tag)).toEqual([
    "5A",
    "9F1A",
  ]);
  expect(result.tlv[0].children?.[0].value_hex).toBe("010203");
  expect(parseTap("a003500141", "hex").tlv[0].children?.[0].value_ascii).toBe(
    "A"
  );
  expect(parseCpm("a003500141", "hex").tlv[0].children).toBeUndefined();
});

test("follows Android long-form length behavior", () => {
  expect(parseTap("50810141", "hex").tlv[0].value_ascii).toBe("A");
  expect(() => parseTap("5082000141", "hex")).toThrow();
});

test("rejects invalid Base64 unused bits and malformed container boundaries", () => {
  expect(() => parseTap("hQVDUFYwMR==", "base64")).toThrow(
    "unused Base64 bits"
  );
  for (const input of [
    "e103500241",
    "5a80",
    "9f",
    "50850102030405",
    "5084ffffffff",
  ]) {
    expect(() => parseTap(input, "hex")).toThrow();
  }
});

test("enforces Android parser limits", () => {
  expect(() => parseTap("5000".repeat(513), "hex")).toThrow("512");
  let nested = "5000";
  for (let index = 0; index < 18; index++) {
    nested = `e1${(nested.length / 2).toString(16).padStart(2, "0")}${nested}`;
  }
  expect(() => parseTap(nested, "hex")).toThrow("16 levels");
  expect(() => parseTap("9f808080808080800000", "hex")).toThrow("8 bytes");
});

test("formats the Android text tree and retains decoded evidence after parse failure", () => {
  expect(formatTapTree(parseTap("4QtaAwECA58aAwQFBg==", "auto").tlv)).toBe(
    "E1 0B\n    5A 03 010203\n    9F1A 03 040506"
  );
  const result = inspectTap("5a0301", "hex");
  expect(result.outcome).toBe("FAILURE");
  expect(result.failureStage).toBe("BER-TLV");
  expect(result.hex).toBe("5A0301");
  expect(result.base64).toBe("WgMB");
  expect(result.tree).toBeNull();
  expect(inspectTap("%%%", "base64").hex).toBeNull();
});
