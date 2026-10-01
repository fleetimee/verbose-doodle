const HEADER_PATTERN = /^\d{4}$/;
const CRC_PATTERN = /^[0-9A-F]{4}$/;

export type QrisField = {
  readonly id: string;
  readonly path: string;
  readonly length: number;
  readonly value: string;
  readonly children: readonly QrisField[];
};

export type QrisIssueCode = "header" | "length" | "duplicate" | "limit";

export class QrisParseError extends Error {
  readonly code: QrisIssueCode;
  readonly path: string;

  constructor(code: QrisIssueCode, path: string) {
    super(`${code}: ${path}`);
    this.name = "QrisParseError";
    this.code = code;
    this.path = path;
  }
}

export function calculateQrisCrc(payload: string): string {
  let crc = 0xff_ff;
  for (const byte of new TextEncoder().encode(payload)) {
    // biome-ignore lint/suspicious/noBitwiseOperators: CRC operates on bits.
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) {
      // biome-ignore lint/suspicious/noBitwiseOperators: CRC polynomial division.
      crc = ((crc << 1) ^ ((crc & 0x80_00) === 0 ? 0 : 0x10_21)) & 0xff_ff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

function parseFields(payload: string, parent = ""): QrisField[] {
  const characters = [...payload];
  const fields: QrisField[] = [];
  const ids = new Set<string>();
  let offset = 0;
  while (offset < characters.length) {
    const header = characters.slice(offset, offset + 4).join("");
    if (!HEADER_PATTERN.test(header)) {
      throw new QrisParseError("header", parent || String(offset));
    }
    const id = header.slice(0, 2);
    const path = parent ? `${parent}.${id}` : id;
    const length = Number(header.slice(2));
    if (length === 0 || offset + 4 + length > characters.length) {
      throw new QrisParseError("length", path);
    }
    if (ids.has(id)) {
      throw new QrisParseError("duplicate", path);
    }
    ids.add(id);
    const value = characters.slice(offset + 4, offset + 4 + length).join("");
    const numericId = Number(id);
    const template =
      !parent &&
      ((numericId >= 26 && numericId <= 51) ||
        id === "62" ||
        id === "64" ||
        numericId >= 80);
    fields.push({
      id,
      path,
      length,
      value,
      children: template ? parseFields(value, path) : [],
    });
    offset += 4 + length;
  }
  return fields;
}

export function parseQris(source: string) {
  const payload = source.trim();
  if (payload.length > 4096) {
    throw new QrisParseError("limit", "");
  }
  const fields = parseFields(payload);
  const get = (id: string) => fields.find((field) => field.id === id)?.value;
  const crc = fields.find((field) => field.id === "63");
  const crcAtEnd = fields.at(-1) === crc && crc?.length === 4;
  const expectedCrc = crcAtEnd ? calculateQrisCrc(payload.slice(0, -4)) : null;
  const crcValid =
    expectedCrc !== null &&
    CRC_PATTERN.test(crc?.value ?? "") &&
    crc?.value === expectedCrc;
  const missing = ["00", "52", "53", "58", "59", "60", "63"].filter(
    (id) => !get(id)
  );
  const hasAccount = fields.some(
    (field) => Number(field.id) >= 2 && Number(field.id) <= 51
  );
  const profileMatches =
    fields[0]?.id === "00" &&
    get("00") === "01" &&
    get("58") === "ID" &&
    get("53") === "360" &&
    hasAccount;
  const modes: Record<string, "static" | "dynamic"> = {
    "11": "static",
    "12": "dynamic",
  };
  const mode = modes[get("01") ?? ""] ?? "unknown";
  return {
    fields,
    crcValid,
    expectedCrc,
    actualCrc: crc?.value ?? null,
    missing,
    profileMatches,
    mode,
    merchant: get("59"),
    city: get("60"),
    amount: get("54"),
    currency: get("53"),
  };
}

const SAMPLE_BODY =
  "00020101021126270013ID.CO.EXAMPLE0106DEMO015204000053033605802ID5913DEMO MERCHANT6010YOGYAKARTA6105551816304";
export const QRIS_SAMPLE = SAMPLE_BODY + calculateQrisCrc(SAMPLE_BODY);

const DYNAMIC_SAMPLE_BODY = `${SAMPLE_BODY.slice(0, -4).replace("010211", "010212")}54051250062130509DEMO-00016304`;
export const QRIS_DYNAMIC_SAMPLE =
  DYNAMIC_SAMPLE_BODY + calculateQrisCrc(DYNAMIC_SAMPLE_BODY);
