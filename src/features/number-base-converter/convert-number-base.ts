export type NumberBase = 2 | 8 | 10 | 16;
export type NumberBitWidth = 8 | 16 | 32 | 64;
export type NumberRepresentation = "signed" | "unsigned";

export type NumberBaseConversionRequest = {
  readonly bitWidth: NumberBitWidth;
  readonly input: string;
  readonly inputBase: NumberBase;
  readonly representation: NumberRepresentation;
};

export type NumberBaseConversionResult = {
  readonly ascii: string;
  readonly binary: string;
  readonly bytes: readonly string[];
  readonly decimal: string;
  readonly hexadecimal: string;
  readonly octal: string;
  readonly signedDecimal: string;
  readonly unsignedDecimal: string;
};

export type NumberBaseConversionErrorCode =
  | "empty-input"
  | "invalid-digit"
  | "negative-non-decimal"
  | "negative-unsigned"
  | "out-of-range";

export class NumberBaseConversionError extends Error {
  readonly code: NumberBaseConversionErrorCode;

  constructor(code: NumberBaseConversionErrorCode, message: string) {
    super(message);
    this.name = "NumberBaseConversionError";
    this.code = code;
  }
}

const DIGIT_PATTERNS: Readonly<Record<NumberBase, RegExp>> = {
  2: /^[01]+$/,
  8: /^[0-7]+$/,
  10: /^\d+$/,
  16: /^[\dA-Fa-f]+$/,
};

const BASE_PREFIXES: Partial<Record<NumberBase, string>> = {
  2: "0b",
  8: "0o",
  16: "0x",
};

function parseMagnitude(input: string, inputBase: NumberBase) {
  let normalized = input.trim().replaceAll("_", "").replaceAll(" ", "");
  if (!normalized) {
    throw new NumberBaseConversionError("empty-input", "Enter a value.");
  }

  const isNegative = normalized.startsWith("-");
  if (isNegative || normalized.startsWith("+")) {
    normalized = normalized.slice(1);
  }

  const prefix = BASE_PREFIXES[inputBase];
  if (prefix && normalized.toLowerCase().startsWith(prefix)) {
    normalized = normalized.slice(prefix.length);
  }

  if (!(normalized && DIGIT_PATTERNS[inputBase].test(normalized))) {
    throw new NumberBaseConversionError(
      "invalid-digit",
      `The value contains a digit that base ${inputBase} does not accept.`
    );
  }

  const bigIntPrefix = BASE_PREFIXES[inputBase] ?? "";
  return {
    isNegative,
    magnitude: BigInt(`${bigIntPrefix}${normalized}`),
  };
}

function toBytes(value: bigint, bitWidth: NumberBitWidth) {
  const bytes: string[] = [];
  const byteCount = bitWidth / 8;
  for (let index = byteCount - 1; index >= 0; index -= 1) {
    const placeValue = 256n ** BigInt(index);
    const byte = Number((value / placeValue) % 256n);
    bytes.push(byte.toString(16).toUpperCase().padStart(2, "0"));
  }
  return bytes;
}

function toAscii(bytes: readonly string[]) {
  return bytes
    .map((byte) => {
      const value = Number.parseInt(byte, 16);
      return value >= 32 && value <= 126 ? String.fromCharCode(value) : "·";
    })
    .join("");
}

export function convertNumberBase({
  bitWidth,
  input,
  inputBase,
  representation,
}: NumberBaseConversionRequest): NumberBaseConversionResult {
  const { isNegative, magnitude } = parseMagnitude(input, inputBase);
  if (isNegative && inputBase !== 10) {
    throw new NumberBaseConversionError(
      "negative-non-decimal",
      "Only decimal input accepts a minus sign. Enter non-decimal signed values as fixed-width bit patterns."
    );
  }
  if (isNegative && representation === "unsigned") {
    throw new NumberBaseConversionError(
      "negative-unsigned",
      "Unsigned values cannot be negative."
    );
  }

  const modulus = 2n ** BigInt(bitWidth);
  const signBit = 2n ** BigInt(bitWidth - 1);
  const maxUnsigned = modulus - 1n;
  const maxSigned = signBit - 1n;
  const minSigned = -signBit;
  const mathematicalValue = isNegative ? -magnitude : magnitude;

  if (isNegative && mathematicalValue < minSigned) {
    throw new NumberBaseConversionError(
      "out-of-range",
      `The value does not fit in a signed ${bitWidth}-bit word.`
    );
  }

  if (
    !isNegative &&
    representation === "signed" &&
    inputBase === 10 &&
    magnitude > maxSigned
  ) {
    throw new NumberBaseConversionError(
      "out-of-range",
      `Decimal signed values must be between ${minSigned} and ${maxSigned}.`
    );
  }

  if (!isNegative && magnitude > maxUnsigned) {
    throw new NumberBaseConversionError(
      "out-of-range",
      `The value does not fit in a ${bitWidth}-bit word.`
    );
  }

  const unsignedValue = isNegative ? modulus + mathematicalValue : magnitude;
  const signedValue =
    unsignedValue >= signBit ? unsignedValue - modulus : unsignedValue;
  const bytes = toBytes(unsignedValue, bitWidth);

  return {
    ascii: toAscii(bytes),
    binary: unsignedValue.toString(2).padStart(bitWidth, "0"),
    bytes,
    decimal: (representation === "signed"
      ? signedValue
      : unsignedValue
    ).toString(),
    hexadecimal: unsignedValue
      .toString(16)
      .toUpperCase()
      .padStart(bitWidth / 4, "0"),
    octal: unsignedValue.toString(8).padStart(Math.ceil(bitWidth / 3), "0"),
    signedDecimal: signedValue.toString(),
    unsignedDecimal: unsignedValue.toString(),
  };
}
