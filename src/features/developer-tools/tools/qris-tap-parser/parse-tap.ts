import {
  type CpmEncoding,
  decodeTlvValue,
  fromBase64,
  fromHex,
  type TlvNode,
  toHex,
} from "@/features/developer-tools/tools/qris-cpm-parser/parse-cpm";

const HEX_INPUT = /^[0-9a-fA-F]+$/u;
// User-provided TAP example.
export const TAP_SAMPLE =
  "hQVDUFYwMWGCArRPB6AAAAYCICBQB1FSSVNDUE1aCFMmEjRWeJASXyANTm92aWFuIEFuZGlrYV8tBGlkZW5fUB1tYWlsdG86YnJpYW5yLnB1dHJhQGdtYWlsLmNvbZ8lApASY4ICWJ90JTIwMjUwOTA5MDk1OTA0MjIyMTAxNDQ2ODYyODIzMjY4NjA5NDmfeoIBJjCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBAK5yKl5n056NnXVS2FdGy2u5dy8zRf2pSCwdxkkavvTo0GeU9Tohq3/qi96HQJCMkNbY5Ju/H9MWRBc3uGnRtm9+SOlM4zzq0xUgKV4YbXhiFTFIXVtm3wP3scFkt4UqXHHwNRgClzLzqkOGIw+CPXYfEtaEKBmbl1LkmBNzTh/v/9TbwMBgRXj/x+b02oMsbVyZy/gk902DDKpOO0BzNw2t1NCP8vhyxqYWLL6u8zhfrnu72rORUe4NtoTXgkz3J4VQcgD9BViNBAoUfEU+lbGoRdD31s8jat6QlHeAsxI2oWILcBmWEaIRNnTww22VqXz4QjcN3EWfzwL+BENLKPECAwEAAZ97ggEAGU0TT3mQaXVrxwrhHnw00yBEVgU4pckntf3wY7UrfjAHvoY/s8jGiprKEKZOJbXZ5G/l8Wrs73XNowQhPsPKomwbJ0QI7kPepjJs73AAFg9sKMkMVSGMuyzhmGKibS5sQDZD+XN0VkW4sHPd2Cf/0V8zdG1adprVkiFNC1VgVgEJqvaAf3y3PQ08qRoxA43oOEpJYyj/D5X56YnBX8QmKMlQx6Eg9v7UxXlpYnCEmJ5njd0Xehe299QIllaX4N4BfdlrqFDWbmbAid4uuAPsecEd5HUpd8QYATBBpOnOT+LUAZwOifX1L/iVTw9x9ewT1nWlnmX4e25jhLEkBa24vg==";
export const TAP_SAMPLE_HEX = toHex(fromBase64(TAP_SAMPLE));

export function decodeTapInput(source: string, encoding: CpmEncoding) {
  const input = source.trim();
  if (!input || input.length > 131_072) {
    throw new Error("Payload must contain between 1 and 131072 characters");
  }
  const autoEncoding =
    HEX_INPUT.test(input) && input.length % 2 === 0 ? "hex" : "base64";
  const selected = encoding === "auto" ? autoEncoding : encoding;
  const bytes = selected === "hex" ? fromHex(input) : fromBase64(input);
  if (selected === "base64" && btoa(atob(input)) !== input) {
    throw new Error("Non-zero unused Base64 bits");
  }
  return {
    bytes,
    encoding: selected,
    base64: btoa(
      Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
    ),
  };
}

export type TapNode = Omit<TlvNode, "children"> & {
  lengthHex: string;
  longLength: boolean;
  children?: TapNode[];
};

// Mirrors nfc-reader-diy's BerTlvParser limits and constructed-tag handling.
export function parseTap(source: string, encoding: CpmEncoding) {
  const { bytes, base64 } = decodeTapInput(source, encoding);
  let position = 0;
  let count = 0;
  function read(end: number) {
    if (position >= end) {
      throw new Error(`BER-TLV data is truncated at byte offset ${position}`);
    }
    return bytes[position++];
  }
  function readTag(end: number) {
    const tagStart = position;
    const first = read(end);
    if (first % 32 === 31) {
      let next = read(end);
      while (next >= 128) {
        if (position - tagStart >= 8) {
          throw new Error("BER-TLV tag exceeds 8 bytes");
        }
        next = read(end);
      }
    }
    const tag = toHex(bytes.slice(tagStart, position)).toUpperCase();
    return { tag, constructed: Math.floor(first / 32) % 2 === 1 };
  }
  function readLength(end: number) {
    const firstLength = read(end);
    let length = firstLength;
    if (firstLength >= 128) {
      const lengthBytes = firstLength - 128;
      if (lengthBytes === 0) {
        throw new Error("Indefinite BER-TLV lengths are unsupported");
      }
      if (lengthBytes > 4) {
        throw new Error("BER-TLV length uses too many bytes");
      }
      let byte = read(end);
      if (byte === 0) {
        throw new Error("BER-TLV long-form length is not minimally encoded");
      }
      length = byte;
      for (let index = 1; index < lengthBytes; index++) {
        byte = read(end);
        length = length * 256 + byte;
      }
      if (length > 2_147_483_647) {
        throw new Error("BER-TLV length exceeds supported size");
      }
    }
    return length;
  }
  function parseNodes(end: number, depth: number): TapNode[] {
    if (depth > 16) {
      throw new Error("BER-TLV nesting exceeds 16 levels");
    }
    const nodes: TapNode[] = [];
    while (position < end) {
      count += 1;
      if (count > 512) {
        throw new Error("BER-TLV node count exceeds 512");
      }
      const { tag, constructed } = readTag(end);
      const lengthStart = position;
      const length = readLength(end);
      const lengthBytes = bytes.slice(lengthStart, position);
      const lengthHex = Array.from(lengthBytes, (byte) =>
        byte.toString(16).padStart(2, "0").toUpperCase()
      ).join(" ");
      const valueEnd = position + length;
      if (valueEnd > end) {
        throw new Error("BER-TLV value exceeds its containing length");
      }
      const value = bytes.slice(position, valueEnd);
      const node: TapNode = {
        ...decodeTlvValue(tag, value, length),
        children: undefined,
        lengthHex,
        longLength: lengthBytes.length > 1,
      };
      if (constructed) {
        node.value_hex = toHex(value);
        node.children = parseNodes(valueEnd, depth + 1);
      }
      position = valueEnd;
      nodes.push(node);
    }
    return nodes;
  }
  return {
    tlv: parseNodes(bytes.length, 0),
    hex: toHex(bytes),
    base64,
    byteLength: bytes.length,
    profileMatches: true,
  };
}

export function formatTapTree(nodes: readonly TapNode[], depth = 0): string {
  return nodes
    .map((node) => {
      const prefix = `${"    ".repeat(depth)}${node.tag} ${node.lengthHex}`;
      const line = node.children
        ? prefix
        : `${prefix}${node.longLength ? "" : " "}${node.value_hex?.toUpperCase() ?? ""}`;
      return node.children?.length
        ? `${line}\n${formatTapTree(node.children, depth + 1)}`
        : line;
    })
    .join("\n");
}

export function inspectTap(source: string, encoding: CpmEncoding) {
  const log: string[] = [];
  let base64: string | null = null;
  let hex: string | null = null;
  let tree: string | null = null;
  let stage = "DECODING";
  try {
    log.push(`INPUT: ${encoding}; ${source.trim().length} characters.`);
    const decoded = decodeTapInput(source, encoding);
    base64 = decoded.base64;
    hex = toHex(decoded.bytes).toUpperCase();
    log.push(
      `DECODING: ${decoded.encoding}; decoded ${decoded.bytes.length} bytes.`
    );
    stage = "BER-TLV";
    tree = formatTapTree(parseTap(source, encoding).tlv);
    log.push(
      "BER-TLV: Parsing completed.",
      "COMPLETE: Local payload inspection completed."
    );
    return {
      outcome: "SUCCESS",
      failureStage: null,
      failure: null,
      base64,
      hex,
      tree,
      log: log.join("\n"),
    };
  } catch (error) {
    const failure = error instanceof Error ? error.message : String(error);
    log.push(`${stage}: ${failure}`);
    return {
      outcome: "FAILURE",
      failureStage: stage,
      failure,
      base64,
      hex,
      tree,
      log: log.join("\n"),
    };
  }
}
