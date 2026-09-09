export type Iso8583PresetId =
  | "sign-on"
  | "account-inquiry"
  | "transaction"
  | "notification"
  | "network-response"
  | "transaction-response"
  | "notification-response"
  | "authorization"
  | "reversal"
  | "batch";

export type Iso8583HeaderType = "none" | "binary-2" | "ascii-4";

export type Iso8583BitmapEncoding = "hex" | "binary";

export type Iso8583FieldKind = "n" | "ans" | "llvar" | "lllvar";

export type Iso8583FieldHelper = "now" | "stan";

export type Iso8583Field = {
  readonly helper?: Iso8583FieldHelper;
  readonly hidden?: boolean;
  readonly kind: Iso8583FieldKind;
  readonly label: string;
  readonly length: number;
  readonly number: number;
  readonly value: string;
  readonly enabled: boolean;
  readonly isCustom?: boolean;
};

export type Iso8583Preset = {
  readonly description: string;
  readonly fields: readonly Iso8583Field[];
  readonly id: Iso8583PresetId;
  readonly label: string;
  readonly mti: string;
};

export type PackIso8583Request = {
  readonly autoBitmap: boolean;
  readonly autoLengthHeader: boolean;
  readonly bitmapEncoding: Iso8583BitmapEncoding;
  readonly fields: readonly Iso8583Field[];
  readonly headerType: Iso8583HeaderType;
  readonly manualLengthHeader?: string;
  readonly manualPrimaryBitmap?: string;
  readonly manualSecondaryBitmap?: string;
  readonly mti: string;
};

export type PackedIso8583Message = {
  readonly activeFields: readonly number[];
  readonly bitmap: string;
  readonly bodyLength: number;
  readonly bodyPayload: string;
  readonly displayPayload: string;
  readonly hexPayload: string;
  readonly isPrintable: boolean;
  readonly lengthHeader: string;
  readonly payload: string;
  readonly primaryBitmap: string;
  readonly secondaryBitmap: string;
  readonly totalLength: number;
};

type Iso8583FieldDefinition = Omit<Iso8583Field, "enabled" | "value"> & {
  readonly defaultEnabled: boolean;
  readonly defaultValue: string;
};

const BITMAP_HEX_PATTERN = /^[0-9A-Fa-f]{16}$/;
const DIGITS_PATTERN = /^\d*$/;
const MTI_PATTERN = /^\d{4}$/;
const STAN_PATTERN = /^\d{1,6}$/;

function field(
  number: number,
  label: string,
  kind: Iso8583FieldKind,
  length: number,
  defaultValue = "",
  helper?: Iso8583FieldHelper,
  hidden = false,
  defaultEnabled = true
): Iso8583FieldDefinition {
  return {
    defaultEnabled,
    defaultValue,
    helper,
    hidden,
    kind,
    label,
    length,
    number,
  };
}

function fieldsFromDefinitions(
  definitions: readonly Iso8583FieldDefinition[]
): Iso8583Field[] {
  return definitions.map(({ defaultEnabled, defaultValue, ...definition }) => ({
    ...definition,
    enabled: defaultEnabled,
    value: defaultValue,
  }));
}

const ACCOUNT_FIELD_63 =
  "1000000000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000C00000000";
const ACCOUNT_FIELD_106 =
  "                         0311219999003200000000000100";

const SIGN_ON_FIELDS: readonly Iso8583FieldDefinition[] = [
  field(7, "Transmission date / time", "n", 10, "0901080037", "now"),
  field(11, "System trace audit number", "n", 6, "003645", "stan"),
  field(33, "Forwarding institution ID", "llvar", 11, "112"),
  field(70, "Network management information code", "n", 3, "001"),
];

const ACCOUNT_INQUIRY_FIELDS: readonly Iso8583FieldDefinition[] = [
  field(2, "Primary account number", "llvar", 19),
  field(3, "Processing code", "n", 6, "392000"),
  field(4, "Amount, transaction", "n", 12, "000000000000"),
  field(7, "Transmission date / time", "n", 10, "0807092509", "now"),
  field(11, "System trace audit number", "n", 6, "000479", "stan"),
  field(12, "Local transaction time", "n", 6, "162509", "now"),
  field(13, "Local transaction date", "n", 4, "0807"),
  field(15, "Settlement date", "n", 4, "0807"),
  field(18, "Merchant type", "n", 4, "6099"),
  field(32, "Acquiring institution ID", "llvar", 11, "112"),
  field(33, "Forwarding institution ID", "llvar", 11, "112"),
  field(37, "Retrieval reference number", "n", 12, "080700000479"),
  field(41, "Card acceptor terminal ID", "ans", 8),
  field(42, "Card acceptor ID code", "ans", 15, "000000000000000"),
  field(
    43,
    "Card acceptor name / location",
    "ans",
    40,
    "KANTOR PUSAT                     DIY IDN"
  ),
  field(49, "Currency code, transaction", "n", 3, "360"),
  field(60, "Reserved private data", "lllvar", 999, "000"),
  field(62, "Reserved private data", "lllvar", 999),
  field(63, "Reserved private data", "lllvar", 999, ACCOUNT_FIELD_63),
  field(106, "Extended private data", "ans", 53, ACCOUNT_FIELD_106),
  field(108, "Private extension", "ans", 0, "", undefined, true),
  field(110, "Private extension", "ans", 0, "", undefined, true),
  field(111, "Private extension", "ans", 0, "", undefined, true),
];

function commonTransactionFields(): readonly Iso8583FieldDefinition[] {
  return [
    field(2, "Primary account number", "llvar", 19, "6214870000000001"),
    field(3, "Processing code", "n", 6, "000000"),
    field(4, "Amount, transaction", "n", 12, "000000010000"),
    field(7, "Transmission date / time", "n", 10, "0101000000", "now"),
    field(11, "System trace audit number", "n", 6, "000001", "stan"),
    field(12, "Local transaction time", "n", 6, "000000", "now"),
    field(13, "Local transaction date", "n", 4, "0101"),
    field(14, "Expiration date", "n", 4, "2512"),
    field(18, "Merchant type", "n", 4, "6011"),
    field(22, "Point of service entry mode", "n", 3, "012"),
    field(25, "Point of service condition code", "n", 2, "00"),
    field(32, "Acquiring institution ID", "llvar", 11, "112"),
    field(37, "Retrieval reference number", "n", 12, "000000000001"),
    field(41, "Card acceptor terminal ID", "ans", 8, "TERM0001"),
    field(42, "Card acceptor ID code", "ans", 15, "000000000000000"),
    field(
      43,
      "Card acceptor name / location",
      "ans",
      40,
      "MERCHANT TEST 01          YOGYAKARTA IDN"
    ),
    field(49, "Currency code, transaction", "n", 3, "360"),
    field(
      62,
      "Reserved private data",
      "lllvar",
      999,
      "",
      undefined,
      false,
      false
    ),
  ];
}

const PRESET_DEFINITIONS: readonly {
  readonly description: string;
  readonly fields: readonly Iso8583FieldDefinition[];
  readonly id: Iso8583PresetId;
  readonly label: string;
  readonly mti: string;
}[] = [
  {
    description: "Network sign-on with the supplied BPD DIY sample values.",
    fields: SIGN_ON_FIELDS,
    id: "sign-on",
    label: "0800 · Sign-On",
    mti: "0800",
  },
  {
    description: "Account inquiry with the supplied BPD DIY sample values.",
    fields: ACCOUNT_INQUIRY_FIELDS,
    id: "account-inquiry",
    label: "0200 · Account Inquiry",
    mti: "0200",
  },
  {
    description: "Card or account authorization request starter fields.",
    fields: commonTransactionFields(),
    id: "authorization",
    label: "0100 · Authorization",
    mti: "0100",
  },
  {
    description: "Financial transaction starter fields.",
    fields: commonTransactionFields(),
    id: "transaction",
    label: "0200 · Transaction",
    mti: "0200",
  },
  {
    description: "Financial notification or advice starter fields.",
    fields: [
      ...commonTransactionFields(),
      field(38, "Authorization ID", "ans", 6, "ABCD12"),
      field(39, "Response code", "n", 2, "00"),
      field(63, "Private / additional data", "lllvar", 999, "00100"),
    ],
    id: "notification",
    label: "0220 · Notification",
    mti: "0220",
  },
  {
    description: "Network management response starter fields.",
    fields: [...SIGN_ON_FIELDS, field(39, "Response code", "n", 2, "00")],
    id: "network-response",
    label: "0810 · Network Response",
    mti: "0810",
  },
  {
    description: "Financial transaction response starter fields.",
    fields: [
      ...commonTransactionFields(),
      field(38, "Authorization ID", "ans", 6, "ABCD12"),
      field(39, "Response code", "n", 2, "00"),
    ],
    id: "transaction-response",
    label: "0210 · Transaction Response",
    mti: "0210",
  },
  {
    description: "Financial notification response starter fields.",
    fields: [
      ...commonTransactionFields(),
      field(38, "Authorization ID", "ans", 6, "ABCD12"),
      field(39, "Response code", "n", 2, "00"),
      field(63, "Private / additional data", "lllvar", 999, "00100"),
    ],
    id: "notification-response",
    label: "0230 · Notification Response",
    mti: "0230",
  },
  {
    description: "Financial reversal request starter fields.",
    fields: [
      ...commonTransactionFields(),
      field(
        90,
        "Original data elements",
        "ans",
        42,
        "020000000101010000000000000011200000000112"
      ),
    ],
    id: "reversal",
    label: "0400 · Reversal",
    mti: "0400",
  },
  {
    description: "Batch or settlement request starter fields.",
    fields: [
      field(3, "Processing code", "n", 6, "920000"),
      field(7, "Transmission date / time", "n", 10, "0101000000", "now"),
      field(11, "System trace audit number", "n", 6, "000001", "stan"),
      field(41, "Card acceptor terminal ID", "ans", 8, "TERM0001"),
      field(42, "Card acceptor ID code", "ans", 15, "000000000000000"),
      field(49, "Currency code, transaction", "n", 3, "360"),
      field(60, "Reserved private data", "lllvar", 999, "000"),
    ],
    id: "batch",
    label: "0500 · Batch / Settlement",
    mti: "0500",
  },
];

export const ISO8583_PRESETS: readonly Iso8583Preset[] = PRESET_DEFINITIONS.map(
  ({ fields, ...definition }) => ({
    ...definition,
    fields: fieldsFromDefinitions(fields),
  })
);

export function getIso8583Preset(id: Iso8583PresetId): Iso8583Preset {
  const preset = ISO8583_PRESETS.find((candidate) => candidate.id === id);
  if (!preset) {
    throw new Error(`Unknown ISO 8583 preset: ${id}`);
  }
  return preset;
}

export function cloneIso8583Fields(
  fields: readonly Iso8583Field[]
): Iso8583Field[] {
  return fields.map((fieldDefinition) => ({ ...fieldDefinition }));
}

export class Iso8583PackingError extends Error {
  readonly code: "field" | "format" | "length" | "mti" | "bitmap";
  readonly fieldNumber?: number;

  constructor(
    code: "field" | "format" | "length" | "mti" | "bitmap",
    message: string,
    fieldNumber?: number
  ) {
    super(message);
    this.code = code;
    this.fieldNumber = fieldNumber;
    this.name = "Iso8583PackingError";
  }
}

function assertAscii(value: string, label: string, fieldNumber?: number) {
  for (const character of value) {
    if (character.charCodeAt(0) > 0x7f) {
      throw new Iso8583PackingError(
        "format",
        `${label} must contain ASCII characters only.`,
        fieldNumber
      );
    }
  }
}

function encodeField(fieldDefinition: Iso8583Field): string {
  const value = fieldDefinition.value;
  const { kind, label, length, number } = fieldDefinition;
  assertAscii(value, `Bit ${number} ${label}`, number);

  if (kind === "n" && !DIGITS_PATTERN.test(value)) {
    throw new Iso8583PackingError(
      "format",
      `Bit ${number} ${label} accepts digits only.`,
      number
    );
  }

  if (kind === "n") {
    if (value.length !== length) {
      throw new Iso8583PackingError(
        "field",
        `Bit ${number} ${label} must be exactly ${length} characters.`,
        number
      );
    }
    return value;
  }

  if (kind === "ans") {
    if (value.length > length) {
      throw new Iso8583PackingError(
        "field",
        `Bit ${number} ${label} cannot exceed ${length} characters.`,
        number
      );
    }
    return value.padEnd(length, " ");
  }

  if (value.length > length) {
    throw new Iso8583PackingError(
      "field",
      `Bit ${number} ${label} cannot exceed ${length} characters.`,
      number
    );
  }

  const prefixWidth = kind === "llvar" ? 2 : 3;
  return `${value.length.toString().padStart(prefixWidth, "0")}${value}`;
}

function validateFields(fields: readonly Iso8583Field[]): Iso8583Field[] {
  const fieldNumbers = new Set<number>();
  const enabledFields: Iso8583Field[] = [];

  for (const fieldDefinition of fields) {
    if (
      !Number.isInteger(fieldDefinition.number) ||
      fieldDefinition.number < 2 ||
      fieldDefinition.number > 128
    ) {
      throw new Iso8583PackingError(
        "field",
        `Bit number ${fieldDefinition.number} must be between 2 and 128.`
      );
    }
    if (fieldNumbers.has(fieldDefinition.number)) {
      throw new Iso8583PackingError(
        "field",
        `Bit ${fieldDefinition.number} is listed more than once.`,
        fieldDefinition.number
      );
    }
    fieldNumbers.add(fieldDefinition.number);
    if (fieldDefinition.enabled) {
      enabledFields.push(fieldDefinition);
    }
  }

  return enabledFields.sort((left, right) => left.number - right.number);
}

function createBitmapBytes(fieldNumbers: readonly number[]) {
  const hasSecondary = fieldNumbers.some((fieldNumber) => fieldNumber > 64);
  const bytes = new Uint8Array(hasSecondary ? 16 : 8);
  if (hasSecondary) {
    bytes[0] += 0x80;
  }

  for (const fieldNumber of fieldNumbers) {
    const zeroBasedBit = fieldNumber - 1;
    const byteIndex = Math.floor(zeroBasedBit / 8);
    const bitIndex = zeroBasedBit % 8;
    bytes[byteIndex] += 2 ** (7 - bitIndex);
  }

  return bytes;
}

function parseBitmapHex(value: string | undefined, label: string): Uint8Array {
  if (!(value && BITMAP_HEX_PATTERN.test(value))) {
    throw new Iso8583PackingError(
      "bitmap",
      `${label} bitmap must contain exactly 16 hexadecimal characters.`
    );
  }

  const bytes = new Uint8Array(8);
  for (let index = 0; index < 8; index += 1) {
    bytes[index] = Number.parseInt(value.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

function bitmapFieldNumbers(
  primaryBytes: Uint8Array,
  secondaryBytes: Uint8Array | null
): number[] {
  const fieldNumbers: number[] = [];
  for (let bit = 2; bit <= 64; bit += 1) {
    const byte = primaryBytes[Math.floor((bit - 1) / 8)];
    const bitIndex = (bit - 1) % 8;
    if (Math.floor(byte / 2 ** (7 - bitIndex)) % 2 === 1) {
      fieldNumbers.push(bit);
    }
  }
  if (secondaryBytes) {
    for (let bit = 65; bit <= 128; bit += 1) {
      const secondaryBit = bit - 64;
      const byte = secondaryBytes[Math.floor((secondaryBit - 1) / 8)];
      const bitIndex = (secondaryBit - 1) % 8;
      if (Math.floor(byte / 2 ** (7 - bitIndex)) % 2 === 1) {
        fieldNumbers.push(bit);
      }
    }
  }
  return fieldNumbers;
}

function hasSecondaryBitmap(bytes: Uint8Array) {
  return bytes[0] >= 0x80;
}

function hexFromBytes(bytes: Uint8Array) {
  return Array.from(bytes, (byte) =>
    byte.toString(16).toUpperCase().padStart(2, "0")
  ).join("");
}

function binaryFromBytes(bytes: Uint8Array) {
  return Array.from(bytes, (byte) => byte.toString(2).padStart(8, "0")).join(
    ""
  );
}

function asciiBytes(value: string) {
  return new TextEncoder().encode(value);
}

function concatBytes(...parts: readonly Uint8Array[]) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const result = new Uint8Array(length);
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

function byteString(bytes: Uint8Array) {
  return String.fromCharCode(...bytes);
}

function displayBytes(bytes: Uint8Array) {
  let display = "";
  let printable = true;
  for (const byte of bytes) {
    if (byte >= 0x20 && byte <= 0x7e) {
      display += String.fromCharCode(byte);
    } else {
      printable = false;
      display += `\\x${byte.toString(16).toUpperCase().padStart(2, "0")}`;
    }
  }
  return { display, printable };
}

function equalNumbers(left: readonly number[], right: readonly number[]) {
  return (
    left.length === right.length &&
    left.every((number, index) => number === right[index])
  );
}

function resolveBitmaps(
  request: PackIso8583Request,
  enabledFields: readonly Iso8583Field[]
) {
  if (request.autoBitmap) {
    const bytes = createBitmapBytes(
      enabledFields.map((fieldDefinition) => fieldDefinition.number)
    );
    return {
      activeFields: enabledFields.map(
        (fieldDefinition) => fieldDefinition.number
      ),
      primaryBytes: bytes.slice(0, 8),
      secondaryBytes: bytes.length === 16 ? bytes.slice(8) : null,
    };
  }

  const primaryBytes = parseBitmapHex(request.manualPrimaryBitmap, "Primary");
  const secondaryBytes = hasSecondaryBitmap(primaryBytes)
    ? parseBitmapHex(request.manualSecondaryBitmap, "Secondary")
    : null;
  const activeFields = bitmapFieldNumbers(primaryBytes, secondaryBytes);
  const enabledNumbers = enabledFields.map(
    (fieldDefinition) => fieldDefinition.number
  );
  if (!equalNumbers(activeFields, enabledNumbers)) {
    throw new Iso8583PackingError(
      "bitmap",
      "The manual bitmap must match the enabled data elements."
    );
  }
  return { activeFields, primaryBytes, secondaryBytes };
}

function resolveLengthHeader(
  request: PackIso8583Request,
  bodyLength: number
): { readonly bytes: Uint8Array; readonly display: string } {
  if (request.headerType === "none") {
    return { bytes: new Uint8Array(), display: "" };
  }

  const length = request.autoLengthHeader
    ? bodyLength
    : Number(request.manualLengthHeader ?? bodyLength);
  if (!Number.isInteger(length) || length < 0) {
    throw new Iso8583PackingError(
      "length",
      "Length header must be a non-negative integer."
    );
  }

  if (request.headerType === "ascii-4") {
    if (length > 9999) {
      throw new Iso8583PackingError(
        "length",
        "A 4-digit ASCII header cannot exceed 9999 bytes."
      );
    }
    const display = length.toString().padStart(4, "0");
    return { bytes: asciiBytes(display), display };
  }

  if (length > 0xff_ff) {
    throw new Iso8583PackingError(
      "length",
      "A 2-byte binary header cannot exceed 65535 bytes."
    );
  }
  const bytes = new Uint8Array([Math.floor(length / 256), length % 256]);
  return { bytes, display: `0x${hexFromBytes(bytes)}` };
}

export function packIso8583(request: PackIso8583Request): PackedIso8583Message {
  if (!MTI_PATTERN.test(request.mti)) {
    throw new Iso8583PackingError(
      "mti",
      "MTI must contain exactly four digits."
    );
  }

  const enabledFields = validateFields(request.fields);
  const { activeFields, primaryBytes, secondaryBytes } = resolveBitmaps(
    request,
    enabledFields
  );
  const primaryBitmap = hexFromBytes(primaryBytes);
  const secondaryBitmap = secondaryBytes ? hexFromBytes(secondaryBytes) : "";
  const bitmap =
    request.bitmapEncoding === "hex"
      ? primaryBitmap + secondaryBitmap
      : binaryFromBytes(
          secondaryBytes
            ? concatBytes(primaryBytes, secondaryBytes)
            : primaryBytes
        );
  let bitmapBytes: Uint8Array;
  if (request.bitmapEncoding === "hex") {
    bitmapBytes = asciiBytes(primaryBitmap + secondaryBitmap);
  } else if (secondaryBytes) {
    bitmapBytes = concatBytes(primaryBytes, secondaryBytes);
  } else {
    bitmapBytes = primaryBytes;
  }
  const fieldBytes = asciiBytes(
    enabledFields
      .map((fieldDefinition) => encodeField(fieldDefinition))
      .join("")
  );
  const bodyBytes = concatBytes(
    asciiBytes(request.mti),
    bitmapBytes,
    fieldBytes
  );
  const lengthHeader = resolveLengthHeader(request, bodyBytes.length);
  const payloadBytes = concatBytes(lengthHeader.bytes, bodyBytes);
  const output = displayBytes(payloadBytes);

  return {
    activeFields,
    bitmap,
    bodyLength: bodyBytes.length,
    bodyPayload: byteString(bodyBytes),
    displayPayload: output.display,
    hexPayload: hexFromBytes(payloadBytes),
    isPrintable: output.printable,
    lengthHeader: lengthHeader.display,
    payload: byteString(payloadBytes),
    primaryBitmap,
    secondaryBitmap,
    totalLength: payloadBytes.length,
  };
}

export function nowValueForField(fieldNumber: number, date = new Date()) {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return fieldNumber === 7
    ? `${month}${day}${hours}${minutes}${seconds}`
    : `${hours}${minutes}${seconds}`;
}

export function incrementStan(value: string) {
  if (!STAN_PATTERN.test(value)) {
    return "000001";
  }
  return ((Number(value) + 1) % 1_000_000).toString().padStart(6, "0");
}

export function fieldTypeLabel(
  fieldDefinition: Pick<Iso8583Field, "kind" | "length">
) {
  if (fieldDefinition.kind === "llvar") {
    return `LLVAR ≤ ${fieldDefinition.length}`;
  }
  if (fieldDefinition.kind === "lllvar") {
    return `LLLVAR ≤ ${fieldDefinition.length}`;
  }
  return `${fieldDefinition.kind} ${fieldDefinition.length}`;
}
