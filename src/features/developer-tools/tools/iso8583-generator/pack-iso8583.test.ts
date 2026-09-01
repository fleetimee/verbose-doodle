import { describe, expect, test } from "bun:test";
import {
  cloneIso8583Fields,
  getIso8583Preset,
  Iso8583PackingError,
  incrementStan,
  nowValueForField,
  packIso8583,
} from "@/features/developer-tools/tools/iso8583-generator/pack-iso8583";

const SIGN_ON_SAMPLE =
  "0060080082200000800000000400000000000000090108003700364503112001";
const ACCOUNT_FIELD_63 =
  "1000000000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000";
const ACCOUNT_PRIVATE_TAIL =
  "                         0311219999003200000000000100";
const ACCOUNT_INQUIRY_SAMPLE = [
  "0373",
  "0200",
  "F23A400188E08016",
  "0000000000560000",
  "00",
  "392000",
  "000000000000",
  "0807092509",
  "000479",
  "162509",
  "0807",
  "0807",
  "6099",
  "03112",
  "03112",
  "080700000479",
  "        ",
  "000000000000000",
  "KANTOR PUSAT                     DIY IDN",
  "360",
  "003000",
  "000",
  `130${ACCOUNT_FIELD_63}`,
  ACCOUNT_PRIVATE_TAIL,
].join("");

function packPreset(
  id: "sign-on" | "account-inquiry",
  overrides: Partial<Parameters<typeof packIso8583>[0]> = {}
) {
  const preset = getIso8583Preset(id);
  return packIso8583({
    autoBitmap: true,
    autoLengthHeader: true,
    bitmapEncoding: "hex",
    fields: cloneIso8583Fields(preset.fields),
    headerType: "ascii-4",
    mti: preset.mti,
    ...overrides,
  });
}

describe("packIso8583", () => {
  test("reproduces the supplied Sign-On sample and resolves its bitmaps", () => {
    const message = packPreset("sign-on");

    expect(message.payload).toBe(SIGN_ON_SAMPLE);
    expect(message.bodyLength).toBe(60);
    expect(message.totalLength).toBe(64);
    expect(message.primaryBitmap).toBe("8220000080000000");
    expect(message.secondaryBitmap).toBe("0400000000000000");
    expect(message.activeFields).toEqual([7, 11, 33, 70]);
  });

  test("reproduces the supplied Account Inquiry sample, including private data", () => {
    const message = packPreset("account-inquiry");

    expect(message.payload).toBe(ACCOUNT_INQUIRY_SAMPLE);
    expect(message.bodyLength).toBe(373);
    expect(message.totalLength).toBe(377);
    expect(message.primaryBitmap).toBe("F23A400188E08016");
    expect(message.secondaryBitmap).toBe("0000000000560000");
    expect(message.activeFields).toEqual([
      2, 3, 4, 7, 11, 12, 13, 15, 18, 32, 33, 37, 41, 42, 43, 49, 60, 62, 63,
      106, 108, 110, 111,
    ]);
  });

  test("adds variable-length prefixes after the user enters the raw value", () => {
    const fields = cloneIso8583Fields(getIso8583Preset("sign-on").fields).map(
      (field) => (field.number === 33 ? { ...field, value: "1234" } : field)
    );
    const message = packPreset("sign-on", { fields });

    expect(message.payload).toContain("041234001");
  });

  test("packs a two-byte header and raw binary bitmap", () => {
    const message = packPreset("sign-on", {
      bitmapEncoding: "binary",
      headerType: "binary-2",
    });

    expect(message.hexPayload.slice(0, 4)).toBe("002C");
    expect(message.hexPayload.slice(4, 12)).toBe("30383030");
    expect(message.hexPayload.slice(12, 28)).toBe("8220000080000000");
    expect(message.hexPayload.slice(28, 44)).toBe("0400000000000000");
    expect(message.isPrintable).toBe(false);
    expect(message.displayPayload.startsWith("\\x00,0800\\x82")).toBe(true);
  });

  test("rejects invalid values and inconsistent manual bitmaps", () => {
    const fields = cloneIso8583Fields(getIso8583Preset("sign-on").fields).map(
      (field) => (field.number === 11 ? { ...field, value: "ABC123" } : field)
    );
    expect(() => packPreset("sign-on", { fields })).toThrow(
      Iso8583PackingError
    );

    expect(() =>
      packPreset("sign-on", {
        autoBitmap: false,
        manualPrimaryBitmap: "8220000080000000",
        manualSecondaryBitmap: "0000000000000000",
      })
    ).toThrow("manual bitmap");
  });
});

describe("ISO 8583 field helpers", () => {
  test("generates protocol-shaped timestamps for fields 7 and 12", () => {
    const date = new Date(2026, 0, 2, 3, 4, 5);

    expect(nowValueForField(7, date)).toBe("0102030405");
    expect(nowValueForField(12, date)).toBe("030405");
  });

  test("increments a six-digit STAN and wraps at one million", () => {
    expect(incrementStan("003645")).toBe("003646");
    expect(incrementStan("999999")).toBe("000000");
    expect(incrementStan("bad")).toBe("000001");
  });
});
