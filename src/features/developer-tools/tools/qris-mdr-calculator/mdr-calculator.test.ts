import { describe, expect, test } from "bun:test";
import {
  calculateQrisMdr,
  DEFAULT_MDR_INPUT,
  formatRupiah,
  MDR_PRESETS,
} from "./mdr-calculator";

describe("QRIS MDR Calculator", () => {
  test("calculates default spreadsheet scenario correctly (Rp108.000, 0.4% MDR)", () => {
    const result = calculateQrisMdr(DEFAULT_MDR_INPUT);

    expect(result.transactionAmount).toBe(108_000);
    expect(result.mdrRate).toBe(0.4);
    expect(result.totalMdr).toBe(432);
    expect(result.totalMdrRounded).toBe(432);
    expect(result.netMerchantAmount).toBe(107_568);
    expect(result.netMerchantAmountRounded).toBe(107_568);

    // Switch: 24% of 432 = 103.68 -> 104
    expect(result.switchSharePercent).toBe(24);
    expect(result.switchAmount).toBeCloseTo(103.68, 2);
    expect(result.switchAmountRounded).toBe(104);

    // Issuer: 31% of 432 = 133.92 -> 134
    expect(result.issuerSharePercent).toBe(31);
    expect(result.issuerAmount).toBeCloseTo(133.92, 2);
    expect(result.issuerAmountRounded).toBe(134);

    // Acquirer: 45% of 432 = 194.40 -> 194
    expect(result.acquirerSharePercent).toBe(45);
    expect(result.acquirerAmount).toBeCloseTo(194.4, 2);
    expect(result.acquirerAmountRounded).toBe(194);

    // Total shares
    expect(result.totalSharePercent).toBe(100);
    expect(result.isShareValid).toBe(true);

    // Sum of rounded shares equals total MDR: 104 + 134 + 194 = 432
    expect(
      result.switchAmountRounded +
        result.issuerAmountRounded +
        result.acquirerAmountRounded
    ).toBe(432);
  });

  test("calculates 0% MDR rate (e.g. UMI free or Government)", () => {
    const result = calculateQrisMdr({
      ...DEFAULT_MDR_INPUT,
      transactionAmount: "50000",
      mdrRate: "0",
    });

    expect(result.totalMdr).toBe(0);
    expect(result.netMerchantAmount).toBe(50_000);
    expect(result.switchAmount).toBe(0);
    expect(result.issuerAmount).toBe(0);
    expect(result.acquirerAmount).toBe(0);
  });

  test("calculates 0.7% MDR rate (Regular / Medium-Large)", () => {
    const result = calculateQrisMdr({
      ...DEFAULT_MDR_INPUT,
      transactionAmount: "1000000",
      mdrRate: "0.7",
    });

    expect(result.totalMdr).toBe(7000);
    expect(result.netMerchantAmount).toBe(993_000);
    expect(result.switchAmount).toBe(1680); // 24% of 7000
    expect(result.issuerAmount).toBe(2170); // 31% of 7000
    expect(result.acquirerAmount).toBe(3150); // 45% of 7000
  });

  test("detects invalid sharing percentages when sum is not 100%", () => {
    const result = calculateQrisMdr({
      ...DEFAULT_MDR_INPUT,
      switchShare: "20",
      issuerShare: "30",
      acquirerShare: "40",
    });

    expect(result.totalSharePercent).toBe(90);
    expect(result.isShareValid).toBe(false);
  });

  test("handles empty or invalid string inputs gracefully", () => {
    const result = calculateQrisMdr({
      transactionAmount: "",
      mdrRate: "abc",
      switchShare: "",
      issuerShare: "",
      acquirerShare: "",
    });

    expect(result.transactionAmount).toBe(0);
    expect(result.mdrRate).toBe(0);
    expect(result.totalMdr).toBe(0);
    expect(result.netMerchantAmount).toBe(0);
    expect(result.isShareValid).toBe(false);
  });

  test("formats currency properly in Indonesian Rupiah", () => {
    expect(formatRupiah(108_000)).toContain("108.000");
    expect(formatRupiah(103.68)).toContain("103,68");
    expect(formatRupiah(103.68, true)).toContain("104");
  });

  test("includes standard MDR presets", () => {
    expect(MDR_PRESETS.length).toBeGreaterThanOrEqual(4);
    expect(MDR_PRESETS.some((preset) => preset.rate === "0.4")).toBe(true);
    expect(MDR_PRESETS.some((preset) => preset.rate === "0.7")).toBe(true);
  });
});
