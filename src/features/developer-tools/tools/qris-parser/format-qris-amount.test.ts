import { describe, expect, test } from "bun:test";
import { formatQrisAmount } from "@/features/developer-tools/tools/qris-parser/format-qris-amount";

describe("QRIS amount display", () => {
  test("formats whole and fractional rupiah without changing units", () => {
    expect(formatQrisAmount("25000", "360")).toBe("Rp25.000,00");
    expect(formatQrisAmount("12500.5", "360")).toBe("Rp12.500,50");
    expect(formatQrisAmount("0.01", "360")).toBe("Rp0,01");
    expect(formatQrisAmount("9007199254740993.99", "360")).toBe(
      "Rp9.007.199.254.740.993,99"
    );
  });
  test("preserves malformed values and foreign currency instead of showing rupiah", () => {
    expect(formatQrisAmount("25000", "840")).toBe("25000 840");
    expect(formatQrisAmount("1.234", "360")).toBe("1.234 360");
    expect(formatQrisAmount("invalid")).toBe("invalid");
  });
});
