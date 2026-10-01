import { describe, expect, test } from "bun:test";
import {
  calculateQrisCrc,
  parseQris,
  QRIS_SAMPLE,
} from "@/features/developer-tools/tools/qris-parser/parse-qris";

const withCrc = (body: string) =>
  `${body}6304${calculateQrisCrc(`${body}6304`)}`;

describe("QRIS MPM parsing", () => {
  test("uses the CRC-16/CCITT-FALSE reference vector", () => {
    expect(calculateQrisCrc("123456789")).toBe("29B1");
  });
  test("decodes a static payload with nested merchant accounts", () => {
    const result = parseQris(`  ${QRIS_SAMPLE}\n`);
    expect(result.crcValid).toBe(true);
    expect(result.profileMatches).toBe(true);
    expect(result.missing).toEqual([]);
    expect(result.mode).toBe("static");
    expect(result.merchant).toBe("DEMO MERCHANT");
    expect(
      result.fields.find((field) => field.id === "26")?.children[0]?.value
    ).toBe("ID.CO.EXAMPLE");
  });
  test("decodes a dynamic amount and additional reference", () => {
    const body =
      QRIS_SAMPLE.slice(0, -8).replace("010211", "010212") +
      "54051000062100506INV001";
    const result = parseQris(withCrc(body));
    expect(result.mode).toBe("dynamic");
    expect(result.amount).toBe("10000");
    expect(
      result.fields.find((field) => field.id === "62")?.children[0]?.value
    ).toBe("INV001");
    expect(result.crcValid).toBe(true);
  });
  test("detects tampering, missing CRC, and a non-final CRC", () => {
    expect(
      parseQris(QRIS_SAMPLE.replace("DEMO MERCHANT", "FAKE MERCHANT")).crcValid
    ).toBe(false);
    expect(parseQris(QRIS_SAMPLE.slice(0, -8)).missing).toContain("63");
    expect(parseQris(`${QRIS_SAMPLE}6501X`).crcValid).toBe(false);
  });
  test("rejects malformed headers, zero/truncated lengths, and duplicate tags", () => {
    for (const payload of [
      "00020",
      "0000",
      "00XX01",
      "000201000201",
      "00020126100002",
    ]) {
      expect(() => parseQris(payload)).toThrow();
    }
    expect(() => parseQris("X".repeat(4097))).toThrow("limit");
  });
  test("preserves spaces and counts Unicode characters while CRC uses UTF-8", () => {
    const result = parseQris(withCrc("0002015903A é"));
    expect(result.merchant).toBe("A é");
    expect(result.crcValid).toBe(true);
  });
  test("preserves unknown tags and flags foreign currency/country", () => {
    const result = parseQris(
      withCrc(
        `${QRIS_SAMPLE.slice(0, -8)
          .replace("5303360", "5303840")
          .replace("5802ID", "5802US")}6501X`
      )
    );
    expect(result.profileMatches).toBe(false);
    expect(result.fields.find((field) => field.id === "65")?.value).toBe("X");
  });
});
