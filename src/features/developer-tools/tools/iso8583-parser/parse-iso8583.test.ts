import { describe, expect, test } from "bun:test";
import { parseIso8583Stream } from "./parse-iso8583";

const MTI_ERROR_PATTERN = /Expected 4-digit MTI/;

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

describe("parseIso8583Stream", () => {
  test("parses a standard Sign-On request stream with ASCII-4 length header", () => {
    const result = parseIso8583Stream(SIGN_ON_SAMPLE);

    expect(result.lengthHeader?.value).toBe(60);
    expect(result.lengthHeader?.type).toBe("ascii-4");
    expect(result.mti.mti).toBe("0800");
    expect(result.mti.messageClass).toBe("Network Management");
    expect(result.mti.messageFunction).toBe("Request");
    expect(result.primaryBitmapHex).toBe("8220000080000000");
    expect(result.secondaryBitmapHex).toBe("0400000000000000");
    expect(result.activeBits).toEqual([7, 11, 33, 70]);

    // Check fields
    expect(result.fields).toHaveLength(4);
    expect(result.fields[0].number).toBe(7);
    expect(result.fields[0].cleanValue).toBe("0901080037");

    expect(result.fields[1].number).toBe(11);
    expect(result.fields[1].cleanValue).toBe("003645");

    expect(result.fields[2].number).toBe(33);
    expect(result.fields[2].cleanValue).toBe("112");

    expect(result.fields[3].number).toBe(70);
    expect(result.fields[3].cleanValue).toBe("001");
    expect(result.fields[3].decodedMeaning).toBe("Sign-On");

    expect(result.isValid).toBe(true);
    expect(result.warnings).toHaveLength(0);
  });

  test("parses stream without length header", () => {
    // Strip 0060 prefix
    const withoutHeader = SIGN_ON_SAMPLE.slice(4);
    const result = parseIso8583Stream(withoutHeader);

    expect(result.lengthHeader).toBeUndefined();
    expect(result.mti.mti).toBe("0800");
    expect(result.activeBits).toEqual([7, 11, 33, 70]);
    expect(result.fields[3].cleanValue).toBe("001");
  });

  test("parses an Account Inquiry sample with primary and secondary bitmaps and LLVAR/LLLVAR fields", () => {
    const result = parseIso8583Stream(ACCOUNT_INQUIRY_SAMPLE);

    expect(result.mti.mti).toBe("0200");
    expect(result.mti.messageClass).toBe("Financial Transaction");
    expect(result.fields.find((f) => f.number === 3)?.cleanValue).toBe(
      "392000"
    );
    expect(result.fields.find((f) => f.number === 3)?.decodedMeaning).toContain(
      "Account Inquiry"
    );
    expect(result.fields.find((f) => f.number === 49)?.cleanValue).toBe("360");
    expect(
      result.fields.find((f) => f.number === 49)?.decodedMeaning
    ).toContain("IDR");

    const bit63 = result.fields.find((f) => f.number === 63);
    expect(bit63?.cleanValue).toBe(ACCOUNT_FIELD_63);
  });

  test("parses hex-encoded stream", () => {
    // Convert SIGN_ON_SAMPLE to hex
    const hexInput = Array.from(SIGN_ON_SAMPLE)
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, "0"))
      .join(" ");

    const result = parseIso8583Stream(hexInput);
    expect(result.mti.mti).toBe("0800");
    expect(result.activeBits).toEqual([7, 11, 33, 70]);
    expect(result.fields[3].cleanValue).toBe("001");
  });

  test("throws descriptive error when MTI is missing or invalid", () => {
    expect(() => parseIso8583Stream("INVALID_PAYLOAD")).toThrow(
      MTI_ERROR_PATTERN
    );
  });
});
