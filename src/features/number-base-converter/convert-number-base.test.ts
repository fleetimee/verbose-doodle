import { describe, expect, test } from "bun:test";
import {
  convertNumberBase,
  NumberBaseConversionError,
} from "@/features/number-base-converter/convert-number-base";

describe("convertNumberBase", () => {
  test("converts an unsigned 8-bit decimal value into every base", () => {
    const result = convertNumberBase({
      bitWidth: 8,
      input: "255",
      inputBase: 10,
      representation: "unsigned",
    });

    expect(result.binary).toBe("11111111");
    expect(result.octal).toBe("377");
    expect(result.decimal).toBe("255");
    expect(result.hexadecimal).toBe("FF");
    expect(result.bytes).toEqual(["FF"]);
    expect(result.ascii).toBe("·");
  });

  test("interprets a non-decimal signed input as a two's-complement bit pattern", () => {
    const result = convertNumberBase({
      bitWidth: 8,
      input: "FF",
      inputBase: 16,
      representation: "signed",
    });

    expect(result.decimal).toBe("-1");
    expect(result.signedDecimal).toBe("-1");
    expect(result.unsignedDecimal).toBe("255");
    expect(result.hexadecimal).toBe("FF");
  });

  test("encodes a negative decimal value into its fixed-width bit pattern", () => {
    const result = convertNumberBase({
      bitWidth: 16,
      input: "-2",
      inputBase: 10,
      representation: "signed",
    });

    expect(result.binary).toBe("1111111111111110");
    expect(result.hexadecimal).toBe("FFFE");
    expect(result.decimal).toBe("-2");
  });

  test("rejects a minus sign for non-decimal bit-pattern input", () => {
    expect(() =>
      convertNumberBase({
        bitWidth: 8,
        input: "-1",
        inputBase: 16,
        representation: "signed",
      })
    ).toThrow("Only decimal input accepts a minus sign");
  });

  test("preserves exact 64-bit values beyond JavaScript's safe integer range", () => {
    const result = convertNumberBase({
      bitWidth: 64,
      input: "FFFF_FFFF_FFFF_FFFF",
      inputBase: 16,
      representation: "unsigned",
    });

    expect(result.decimal).toBe("18446744073709551615");
    expect(result.binary).toHaveLength(64);
    expect(result.hexadecimal).toBe("FFFFFFFFFFFFFFFF");
  });

  test("accepts a matching prefix and exposes bytes in network order", () => {
    const result = convertNumberBase({
      bitWidth: 32,
      input: "0x4142_4344",
      inputBase: 16,
      representation: "unsigned",
    });

    expect(result.bytes).toEqual(["41", "42", "43", "44"]);
    expect(result.ascii).toBe("ABCD");
  });

  test("rejects invalid digits, overflow, and incompatible signs", () => {
    const invalidRequests = [
      { bitWidth: 8, input: "", inputBase: 10, representation: "unsigned" },
      { bitWidth: 8, input: "2", inputBase: 2, representation: "unsigned" },
      { bitWidth: 8, input: "256", inputBase: 10, representation: "unsigned" },
      { bitWidth: 8, input: "128", inputBase: 10, representation: "signed" },
      { bitWidth: 8, input: "-1", inputBase: 10, representation: "unsigned" },
      { bitWidth: 8, input: "0xFF", inputBase: 10, representation: "unsigned" },
    ] as const;

    for (const request of invalidRequests) {
      expect(() => convertNumberBase(request)).toThrow(
        NumberBaseConversionError
      );
    }
  });
});
