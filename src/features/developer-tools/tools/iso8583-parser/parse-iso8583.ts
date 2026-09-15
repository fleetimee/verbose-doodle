import { formatMessage, messages } from "@/lib/i18n";
import {
  ISO8583_FIELD_DICTIONARY,
  ISO8583_FIELD_ENUMS,
} from "../iso8583-generator/iso8583-enums";
import type { Iso8583FieldKind } from "../iso8583-generator/pack-iso8583";

export type ParsedIso8583Field = {
  readonly number: number;
  readonly name: string;
  readonly kind: Iso8583FieldKind;
  readonly maxOrFixedLength: number;
  readonly rawValue: string;
  readonly cleanValue: string;
  readonly decodedMeaning?: string;
  readonly rawSlice: string;
  readonly startIndex: number;
  readonly endIndex: number;
};

export type MtiClassification = {
  readonly mti: string;
  readonly version: string;
  readonly messageClass: string;
  readonly messageFunction: string;
  readonly messageOrigin: string;
  readonly description: string;
};

export type ParsedIso8583Message = {
  readonly rawStream: string;
  readonly sanitizedStream: string;
  readonly streamFormat: "ascii" | "hex";
  readonly lengthHeader?: {
    readonly raw: string;
    readonly type: "ascii-4" | "binary-2";
    readonly value: number;
  };
  readonly mti: MtiClassification;
  readonly primaryBitmapHex: string;
  readonly secondaryBitmapHex?: string;
  readonly bitmapBinary: string;
  readonly activeBits: readonly number[];
  readonly fields: readonly ParsedIso8583Field[];
  readonly remainingStream: string;
  readonly totalParsedBytes: number;
  readonly isValid: boolean;
  readonly warnings: readonly string[];
};

const HEX_PATTERN = /^[0-9A-Fa-f]+$/;
const MTI_PATTERN = /^\d{4}$/;
const BITMAP_HEX_PATTERN = /^[0-9A-Fa-f]{16}$/;
const ASCII_HEADER_STREAM_PATTERN = /^\d{4}\d{4}[0-9A-Fa-f]{16}/;
const HEX_ASCII_CHECK_PATTERN = /^3[0-9]3[0-9]/;
const FOUR_DIGITS_PATTERN = /^\d{4}/;
const CONVERTED_MTI_PATTERN = /\b\d{4}[0-9A-Fa-f]{16}/;
const ESCAPE_PREFIX_PATTERN = /^(\\x[0-9A-Fa-f]{2})+/;
const WHITESPACE_PATTERN = /\s+/g;

const MTI_CLASSES: Record<string, string> = {
  "1": "Authorization",
  "2": "Financial Transaction",
  "3": "File Actions",
  "4": "Reversal / Chargeback",
  "5": "Reconciliation / Settlement",
  "6": "Administrative",
  "7": "Fee Collection",
  "8": "Network Management",
  "9": "Reserved",
};

const MTI_FUNCTIONS: Record<string, string> = {
  "0": "Request",
  "1": "Response",
  "2": "Advice",
  "3": "Advice Response",
  "4": "Notification",
  "8": "Response Acknowledgment",
};

const MTI_ORIGINS: Record<string, string> = {
  "0": "Acquirer",
  "1": "Acquirer Repeat",
  "2": "Issuer",
  "3": "Issuer Repeat",
  "4": "Other",
  "5": "Other Repeat",
};

const MTI_COMMON_DESCRIPTIONS: Record<string, string> = {
  "0100": "Authorization Request",
  "0110": "Authorization Response",
  "0200": "Financial Transaction Request",
  "0210": "Financial Transaction Response",
  "0220": "Financial Notification / Advice",
  "0230": "Financial Notification Response",
  "0400": "Reversal Request",
  "0410": "Reversal Response",
  "0420": "Reversal Advice",
  "0430": "Reversal Advice Response",
  "0500": "Settlement / Batch Request",
  "0510": "Settlement / Batch Response",
  "0800": "Network Management Request (Sign-On / Echo)",
  "0810": "Network Management Response",
  "0820": "Network Management Advice",
};

export function classifyMti(mti: string): MtiClassification {
  const versionDigit = mti[0] ?? "0";
  const classDigit = mti[1] ?? "0";
  const functionDigit = mti[2] ?? "0";
  const originDigit = mti[3] ?? "0";

  let version = `Custom (${versionDigit})`;
  if (versionDigit === "0") {
    version = "ISO 8583:1987";
  } else if (versionDigit === "1") {
    version = "ISO 8583:1993";
  } else if (versionDigit === "2") {
    version = "ISO 8583:2003";
  }

  const messageClass = MTI_CLASSES[classDigit] ?? `Class ${classDigit}`;
  const messageFunction =
    MTI_FUNCTIONS[functionDigit] ?? `Function ${functionDigit}`;
  const messageOrigin = MTI_ORIGINS[originDigit] ?? `Origin ${originDigit}`;

  const description =
    MTI_COMMON_DESCRIPTIONS[mti] ??
    `${messageClass} ${messageFunction} (${messageOrigin})`;

  return {
    description,
    messageClass,
    messageFunction,
    messageOrigin,
    mti,
    version,
  };
}

const STANDARD_FIELD_FALLBACKS: Record<
  number,
  { label: string; kind: Iso8583FieldKind; length: number }
> = {
  1: { kind: "ans", label: "Secondary Bitmap", length: 16 },
  8: { kind: "n", label: "Amount, Cardholder billing fee", length: 8 },
  16: { kind: "n", label: "Date, Conversion", length: 4 },
  17: { kind: "n", label: "Date, Capture", length: 4 },
  19: { kind: "n", label: "Acquiring institution country code", length: 3 },
  20: { kind: "n", label: "PAN extended country code", length: 3 },
  21: { kind: "n", label: "Forwarding institution country code", length: 3 },
  24: { kind: "n", label: "Network international ID", length: 3 },
  27: { kind: "n", label: "Auth ID response length", length: 1 },
  29: { kind: "n", label: "Amount, Settlement fee", length: 9 },
  30: { kind: "n", label: "Amount, Transaction processing fee", length: 9 },
  31: { kind: "n", label: "Amount, Settlement processing fee", length: 9 },
  34: { kind: "llvar", label: "Extended PAN", length: 28 },
  36: { kind: "lllvar", label: "Track 3 data", length: 104 },
  40: { kind: "ans", label: "Service restriction code", length: 3 },
  44: { kind: "llvar", label: "Additional response data", length: 25 },
  45: { kind: "llvar", label: "Track 1 data", length: 76 },
  46: { kind: "lllvar", label: "Amounts, Fees", length: 999 },
  47: { kind: "lllvar", label: "Additional data - National", length: 999 },
  53: { kind: "n", label: "Security related control information", length: 16 },
  55: {
    kind: "lllvar",
    label: "Integrated circuit card (ICC) data",
    length: 999,
  },
  56: { kind: "llvar", label: "Original data elements", length: 35 },
  64: { kind: "ans", label: "Primary MAC", length: 16 },
  96: { kind: "ans", label: "Key management data", length: 64 },
};

export function getFieldSpec(fieldNumber: number): {
  readonly label: string;
  readonly kind: Iso8583FieldKind;
  readonly length: number;
} {
  const dict = ISO8583_FIELD_DICTIONARY[fieldNumber];
  if (dict) {
    return {
      kind: dict.kind,
      label: dict.label,
      length: dict.length,
    };
  }

  const fallback = STANDARD_FIELD_FALLBACKS[fieldNumber];
  if (fallback) {
    return fallback;
  }

  return {
    kind: fieldNumber > 64 ? "lllvar" : "ans",
    label: `Field ${fieldNumber} (Custom / Private)`,
    length: 999,
  };
}

export function decodeFieldSemanticMeaning(
  fieldNumber: number,
  value: string
): string | undefined {
  const enums = ISO8583_FIELD_ENUMS[fieldNumber];
  if (enums) {
    const match = enums.find((opt) => opt.value === value.trim());
    if (match) {
      return match.label.includes("·")
        ? match.label.split("·")[1]?.trim()
        : match.label;
    }
  }

  if (fieldNumber === 4 || fieldNumber === 5 || fieldNumber === 6) {
    const num = Number.parseInt(value, 10);
    if (!Number.isNaN(num)) {
      return `Amount: ${new Intl.NumberFormat("id-ID").format(num)}`;
    }
  }

  if (fieldNumber === 7 && value.length === 10) {
    const mm = value.slice(0, 2);
    const dd = value.slice(2, 4);
    const hh = value.slice(4, 6);
    const mi = value.slice(6, 8);
    const ss = value.slice(8, 10);
    return `Transmission: ${dd}/${mm} ${hh}:${mi}:${ss}`;
  }

  if (fieldNumber === 11) {
    return `Trace / STAN: #${value}`;
  }

  if (fieldNumber === 12 && value.length === 6) {
    return `Local Time: ${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
  }

  if (fieldNumber === 13 && value.length === 4) {
    return `Local Date: ${value.slice(2, 4)}/${value.slice(0, 2)}`;
  }

  return undefined;
}

function isHexStream(input: string): boolean {
  const stripped = input.replace(WHITESPACE_PATTERN, "");
  return (
    stripped.length >= 8 &&
    stripped.length % 2 === 0 &&
    HEX_PATTERN.test(stripped) &&
    (HEX_ASCII_CHECK_PATTERN.test(stripped) ||
      !FOUR_DIGITS_PATTERN.test(stripped))
  );
}

function hexToAscii(hex: string): string {
  let ascii = "";
  const cleanHex = hex.replace(WHITESPACE_PATTERN, "");
  for (let i = 0; i < cleanHex.length; i += 2) {
    const byteValue = Number.parseInt(cleanHex.slice(i, i + 2), 16);
    ascii += String.fromCharCode(byteValue);
  }
  return ascii;
}

function normalizeStream(rawInput: string): {
  stream: string;
  streamFormat: "ascii" | "hex";
} {
  let stream = rawInput.trim();
  let streamFormat: "ascii" | "hex" = "ascii";

  if (isHexStream(stream)) {
    try {
      const converted = hexToAscii(stream);
      if (CONVERTED_MTI_PATTERN.test(converted)) {
        stream = converted;
        streamFormat = "hex";
      }
    } catch {
      // Keep ascii
    }
  }

  if (stream.startsWith("\\x") || stream.startsWith("0x")) {
    stream = stream.replace(ESCAPE_PREFIX_PATTERN, (match) => {
      let decoded = "";
      const parts = match.split("\\x").filter(Boolean);
      for (const part of parts) {
        decoded += String.fromCharCode(Number.parseInt(part, 16));
      }
      return decoded;
    });
  }

  return { stream, streamFormat };
}

function extractLengthHeader(stream: string): {
  lengthHeader?: ParsedIso8583Message["lengthHeader"];
  index: number;
} {
  if (ASCII_HEADER_STREAM_PATTERN.test(stream)) {
    const headerStr = stream.slice(0, 4);
    const headerVal = Number.parseInt(headerStr, 10);
    if (headerVal > 10 && headerVal <= stream.length) {
      return {
        index: 4,
        lengthHeader: {
          raw: headerStr,
          type: "ascii-4",
          value: headerVal,
        },
      };
    }
  } else if (stream.length >= 2 && stream.charCodeAt(0) === 0) {
    const byte0 = stream.charCodeAt(0);
    const byte1 = stream.charCodeAt(1);
    const len = byte0 * 256 + byte1;
    return {
      index: 2,
      lengthHeader: {
        raw: `0x${byte0.toString(16).padStart(2, "0")}${byte1.toString(16).padStart(2, "0")}`,
        type: "binary-2",
        value: len,
      },
    };
  }

  return { index: 0 };
}

function hexToBinary(hexStr: string): string {
  let binary = "";
  for (const char of hexStr) {
    const nibble = Number.parseInt(char, 16);
    binary += nibble.toString(2).padStart(4, "0");
  }
  return binary;
}

function extractBitmaps(
  stream: string,
  startIndex: number
): {
  primaryBitmapHex: string;
  secondaryBitmapHex?: string;
  activeBits: number[];
  bitmapBinary: string;
  nextIndex: number;
} {
  const primaryBitmapHex = stream.slice(startIndex, startIndex + 16);
  if (!BITMAP_HEX_PATTERN.test(primaryBitmapHex)) {
    throw new Error(
      formatMessage(messages.iso8583Parser.parseErrors.invalidPrimaryBitmap, {
        position: startIndex,
        value: primaryBitmapHex,
      })
    );
  }

  let index = startIndex + 16;
  const primaryBinary = hexToBinary(primaryBitmapHex);
  let secondaryBitmapHex: string | undefined;
  let secondaryBinary = "";

  if (primaryBinary[0] === "1") {
    secondaryBitmapHex = stream.slice(index, index + 16);
    if (!BITMAP_HEX_PATTERN.test(secondaryBitmapHex)) {
      throw new Error(
        formatMessage(
          messages.iso8583Parser.parseErrors.invalidSecondaryBitmap,
          {
            position: index,
            value: secondaryBitmapHex,
          }
        )
      );
    }
    index += 16;
    secondaryBinary = hexToBinary(secondaryBitmapHex);
  }

  const bitmapBinary = primaryBinary + secondaryBinary;
  const activeBits: number[] = [];

  for (let bit = 2; bit <= bitmapBinary.length; bit++) {
    if (bitmapBinary[bit - 1] === "1") {
      activeBits.push(bit);
    }
  }

  return {
    activeBits,
    bitmapBinary,
    nextIndex: index,
    primaryBitmapHex,
    secondaryBitmapHex,
  };
}

function unpackField(
  stream: string,
  startIndex: number,
  bitNumber: number
): {
  field?: ParsedIso8583Field;
  nextIndex: number;
  warning?: string;
} {
  const spec = getFieldSpec(bitNumber);
  let index = startIndex;
  let rawValue = "";
  let cleanValue = "";
  let warning: string | undefined;

  if (index >= stream.length) {
    return {
      nextIndex: index,
      warning: formatMessage(
        messages.iso8583Parser.parseWarnings.fieldUnavailable,
        { bit: bitNumber, label: spec.label }
      ),
    };
  }

  if (spec.kind === "n" || spec.kind === "ans") {
    const end = index + spec.length;
    if (end > stream.length) {
      warning = formatMessage(
        messages.iso8583Parser.parseWarnings.fieldExpected,
        {
          available: stream.length - index,
          bit: bitNumber,
          expected: spec.length,
          label: spec.label,
        }
      );
      rawValue = stream.slice(index);
      cleanValue = rawValue.trim();
      index = stream.length;
    } else {
      rawValue = stream.slice(index, end);
      cleanValue = rawValue.trim();
      index = end;
    }
  } else {
    const prefixLen = spec.kind === "llvar" ? 2 : 3;
    const lenStr = stream.slice(index, index + prefixLen);
    index += prefixLen;
    const dataLen = Number.parseInt(lenStr, 10);
    if (Number.isNaN(dataLen)) {
      return {
        nextIndex: index,
        warning: formatMessage(
          messages.iso8583Parser.parseWarnings.fieldLengthPrefix,
          { bit: bitNumber, label: spec.label, prefix: lenStr }
        ),
      };
    }
    rawValue = stream.slice(index, index + dataLen);
    cleanValue = rawValue;
    index += dataLen;
  }

  const field: ParsedIso8583Field = {
    cleanValue,
    decodedMeaning: decodeFieldSemanticMeaning(bitNumber, cleanValue),
    endIndex: index,
    kind: spec.kind,
    maxOrFixedLength: spec.length,
    name: spec.label,
    number: bitNumber,
    rawSlice: stream.slice(startIndex, index),
    rawValue,
    startIndex,
  };

  return { field, nextIndex: index, warning };
}

export function parseIso8583Stream(rawInput: string): ParsedIso8583Message {
  const warnings: string[] = [];
  const { stream, streamFormat } = normalizeStream(rawInput);
  const { lengthHeader, index: headerIndex } = extractLengthHeader(stream);

  let index = headerIndex;
  const mtiCandidate = stream.slice(index, index + 4);
  if (!MTI_PATTERN.test(mtiCandidate)) {
    throw new Error(
      formatMessage(messages.iso8583Parser.parseErrors.invalidMti, {
        position: index,
        value: mtiCandidate,
      })
    );
  }
  const mti = classifyMti(mtiCandidate);
  index += 4;

  const {
    activeBits,
    bitmapBinary,
    primaryBitmapHex,
    secondaryBitmapHex,
    nextIndex: bitmapNextIndex,
  } = extractBitmaps(stream, index);
  index = bitmapNextIndex;

  const fields: ParsedIso8583Field[] = [];
  for (const bitNumber of activeBits) {
    const unpacked = unpackField(stream, index, bitNumber);
    index = unpacked.nextIndex;
    if (unpacked.warning) {
      warnings.push(unpacked.warning);
      break;
    }
    if (unpacked.field) {
      fields.push(unpacked.field);
    }
  }

  const remainingStream = stream.slice(index);
  if (remainingStream.length > 0) {
    warnings.push(
      formatMessage(messages.iso8583Parser.parseWarnings.trailingBytes, {
        count: remainingStream.length,
        value: remainingStream,
      })
    );
  }

  return {
    activeBits,
    bitmapBinary,
    fields,
    isValid: warnings.length === 0,
    lengthHeader,
    mti,
    primaryBitmapHex,
    rawStream: rawInput,
    remainingStream,
    sanitizedStream: stream,
    secondaryBitmapHex,
    streamFormat,
    totalParsedBytes: index,
    warnings,
  };
}
