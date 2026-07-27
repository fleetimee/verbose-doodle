export type NdefRecordInspection = {
  readonly index: number;
  readonly tnf: number;
  readonly type: string;
  readonly typeHex: string;
  readonly id: string | null;
  readonly idHex: string | null;
  readonly payload: string | null;
  readonly payloadHex: string;
  readonly raw: string;
};

export type NdefDecodingStatus =
  | "decoded"
  | "no-text"
  | "unsupported"
  | "malformed";

export type NdefScanResult = {
  readonly timestamp: string;
  readonly decodedText?: string;
  readonly rawNdef: string;
  readonly uid?: string;
  readonly records: readonly NdefRecordInspection[];
  readonly decodingStatus: NdefDecodingStatus;
  readonly warning?: string;
};

const NDEF_TNF_WELL_KNOWN = 0x01;
const NDEF_TYPE_TEXT = 0x54;

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"))
    .join(" ")
    .toUpperCase();
}

function decodeUtf8(bytes: Uint8Array): string | null {
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function decodeTextPayload(payload: Uint8Array): string | null {
  if (payload.length < 1) {
    return null;
  }
  const languageLength = payload[0] & 0x3f;
  if (languageLength + 1 > payload.length) {
    return null;
  }
  const textBytes = payload.slice(languageLength + 1);
  if (payload[0] & 0x80) {
    try {
      return new TextDecoder("utf-16").decode(textBytes);
    } catch {
      return null;
    }
  }
  return decodeUtf8(textBytes);
}

function decodeType(typeBytes: Uint8Array): string {
  return decodeUtf8(typeBytes) ?? toHex(typeBytes);
}

function createUnparsedRecord(raw: Uint8Array): NdefRecordInspection {
  const rawHex = toHex(raw);
  return {
    id: null,
    idHex: null,
    index: 0,
    payload: null,
    payloadHex: rawHex,
    raw: rawHex,
    tnf: 0,
    type: "Unparsed record",
    typeHex: "",
  };
}

type NdefRecordHeader = {
  readonly header: number;
  readonly typeLength: number;
  readonly payloadLength: number;
  readonly idLength: number;
  readonly offset: number;
};

function readRecordHeader(raw: Uint8Array, start: number): NdefRecordHeader {
  let offset = start;
  if (raw.length - offset < 2) {
    throw new Error("The NDEF message contains a truncated record header.");
  }

  const header = raw[offset++];
  const typeLength = raw[offset++];
  const shortRecord = Boolean(header & 0x10);
  let payloadLength: number;
  if (shortRecord) {
    if (offset >= raw.length) {
      throw new Error("The NDEF message contains a truncated payload length.");
    }
    payloadLength = raw[offset++];
  } else {
    if (raw.length - offset < 4) {
      throw new Error("The NDEF message contains a truncated payload length.");
    }
    payloadLength = new DataView(
      raw.buffer,
      raw.byteOffset + offset,
      4
    ).getUint32(0);
    offset += 4;
  }

  const hasId = (header & 0x08) !== 0;
  const idLength = hasId ? raw[offset++] : 0;
  if (hasId && idLength === undefined) {
    throw new Error("The NDEF message contains a truncated ID length.");
  }
  return {
    header,
    idLength,
    offset,
    payloadLength,
    typeLength,
  };
}

function parseRecords(raw: Uint8Array): NdefRecordInspection[] {
  const records: NdefRecordInspection[] = [];
  let offset = 0;
  let messageEnded = false;

  while (offset < raw.length) {
    const recordStart = offset;
    const headerData = readRecordHeader(raw, offset);
    const { header, idLength, payloadLength, typeLength } = headerData;
    offset = headerData.offset;
    const tnf = header & 0x07;

    const totalLength = typeLength + idLength + payloadLength;
    if (raw.length - offset < totalLength) {
      throw new Error("The NDEF record payload is truncated.");
    }

    const typeBytes = raw.slice(offset, offset + typeLength);
    offset += typeLength;
    const idBytes = raw.slice(offset, offset + idLength);
    offset += idLength;
    const payloadBytes = raw.slice(offset, offset + payloadLength);
    offset += payloadLength;

    const isTextRecord =
      tnf === NDEF_TNF_WELL_KNOWN &&
      typeBytes.length === 1 &&
      typeBytes[0] === NDEF_TYPE_TEXT;
    const decodedPayload = isTextRecord
      ? decodeTextPayload(payloadBytes)
      : null;

    records.push({
      id: idBytes.length > 0 ? decodeUtf8(idBytes) : null,
      idHex: idBytes.length > 0 ? toHex(idBytes) : null,
      index: records.length,
      payload: decodedPayload,
      payloadHex: toHex(payloadBytes),
      raw: toHex(raw.slice(recordStart, offset)),
      tnf,
      type: decodeType(typeBytes),
      typeHex: toHex(typeBytes),
    });

    messageEnded = Boolean(header & 0x40);
    if (messageEnded) {
      break;
    }
  }

  if (records.length === 0) {
    throw new Error("The NDEF message does not contain any records.");
  }
  if (!messageEnded) {
    throw new Error("The NDEF message does not mark its final record.");
  }
  return records;
}

export function extractNdefMessage(memory: Uint8Array): Uint8Array | undefined {
  let offset = 0;
  while (offset < memory.length) {
    const type = memory[offset++];
    if (type === 0x00) {
      continue;
    }
    if (type === 0xfe) {
      return;
    }
    if (offset >= memory.length) {
      return;
    }

    let length = memory[offset++];
    if (length === 0xff) {
      if (memory.length - offset < 2) {
        return;
      }
      length = (memory[offset] << 8) | memory[offset + 1];
      offset += 2;
    }
    if (memory.length - offset < length) {
      return;
    }
    if (type === 0x03) {
      return memory.slice(offset, offset + length);
    }
    offset += length;
  }
  return;
}

export function parseNdefMessage(
  raw: Uint8Array,
  metadata: { readonly timestamp?: string; readonly uid?: Uint8Array } = {}
): NdefScanResult {
  const timestamp = metadata.timestamp ?? new Date().toISOString();
  const base = {
    rawNdef: toHex(raw),
    timestamp,
    ...(metadata.uid ? { uid: toHex(metadata.uid) } : {}),
  };

  try {
    const records = parseRecords(raw);
    const hasMalformedTextRecord = records.some(
      (record) => isNdefTextRecord(record) && record.payload === null
    );
    if (hasMalformedTextRecord) {
      return {
        ...base,
        decodingStatus: "malformed",
        records,
        warning: "One or more NDEF text records could not be decoded.",
      };
    }

    const hasUnsupportedRecord = records.some(
      (record) =>
        record.tnf !== NDEF_TNF_WELL_KNOWN ||
        (record.typeHex !== "54" && record.typeHex !== "55")
    );
    const text = records
      .filter(
        (record) =>
          record.tnf === NDEF_TNF_WELL_KNOWN &&
          record.typeHex === toHex(Uint8Array.from([NDEF_TYPE_TEXT])) &&
          record.payload !== null
      )
      .map((record) => record.payload as string)
      .join("\n");
    let decodingStatus: NdefDecodingStatus = "no-text";
    if (hasUnsupportedRecord) {
      decodingStatus = "unsupported";
    } else if (text) {
      decodingStatus = "decoded";
    }
    return {
      ...base,
      ...(text ? { decodedText: text } : {}),
      decodingStatus,
      records,
      ...(hasUnsupportedRecord
        ? {
            warning:
              "One or more NDEF record types are not decoded by this inspector; raw data is preserved.",
          }
        : {}),
    };
  } catch (error) {
    return {
      ...base,
      decodingStatus: "malformed",
      records: [createUnparsedRecord(raw)],
      warning:
        error instanceof Error
          ? error.message
          : "The NDEF message is malformed.",
    };
  }
}

export function ndefBytesToHex(bytes: Uint8Array): string {
  return toHex(bytes);
}

export function isNdefTextRecord(record: NdefRecordInspection): boolean {
  return record.tnf === NDEF_TNF_WELL_KNOWN && record.typeHex === "54";
}
