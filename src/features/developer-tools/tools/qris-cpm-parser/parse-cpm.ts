const decoder = new TextDecoder();
const TRAILING_F_RE = /F$/u;
const HEX_RE = /^[0-9a-fA-F]*$/u;
const BASE64_RE =
  /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/u;

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

const hexToBytes = (hex: string): Uint8Array => {
  const clean = hex;
  if (!HEX_RE.test(clean)) {
    throw new Error("Invalid hex characters");
  }
  if (clean.length % 2 !== 0) {
    throw new Error("Odd hex length");
  }
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    out[i / 2] = Number.parseInt(clean.slice(i, i + 2), 16);
  }
  return out;
};

const isAsciiPrintable = (bytes: Uint8Array): boolean => {
  for (const b of bytes) {
    if (b < 0x20 || b > 0x7e) {
      return false;
    }
  }
  return true;
};

const decodeAscii = (bytes: Uint8Array): string | undefined => {
  if (bytes.length === 0) {
    return "";
  }
  return isAsciiPrintable(bytes) ? decoder.decode(bytes) : undefined;
};

const decodeBcd = (bytes: Uint8Array): string => {
  const hex = bytesToHex(bytes).toUpperCase();
  return hex.replace(TRAILING_F_RE, "");
};

const TAG_NAMES: Record<string, string> = {
  "85": "Payload Format Indicator",
  "61": "Application Template",
  "4F": "ADF Name (AID)",
  "50": "Application Label",
  "5A": "CPAN",
  "5F20": "Cardholder Name",
  "5F2D": "Language",
  "5F50": "Issuer URL",
  "9F25": "CPAN Last 4",
  "63": "Application Specific Transparent Template",
  "9F74": "Issuer Private Data",
  "9F7A": "Issuer Public Key Certificate or Public Key Material",
  "9F7B": "Issuer Authentication Signature",
};

export type TlvNode = {
  tag: string;
  name?: string;
  length: number;
  value_hex?: string;
  value_ascii?: string;
  value_bcd?: string;
  value_b64?: string;
  children?: TlvNode[];
};

const parseTag = (
  buf: Uint8Array,
  off: number
): { tag: string; next: number } => {
  let i = off;
  const first = buf[i];
  i += 1;
  const tagBytes: number[] = [first];
  if (first % 32 === 31) {
    let hasMoreTagBytes = true;
    while (hasMoreTagBytes) {
      if (i >= buf.length) {
        throw new Error("Unexpected end of buffer in multi-byte tag");
      }
      const b = buf[i];
      tagBytes.push(b);
      i += 1;
      hasMoreTagBytes = b >= 0x80;
    }
  }
  const tag = tagBytes
    .map((t) => t.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return { tag, next: i };
};

const parseLength = (
  buf: Uint8Array,
  off: number
): { len: number; next: number } => {
  let i = off;
  if (i >= buf.length) {
    throw new Error("Unexpected end of buffer while reading length");
  }
  const first = buf[i];
  i += 1;
  if (first < 0x80) {
    return { len: first, next: i };
  }
  const count = first - 0x80;
  if (count === 0) {
    throw new Error("Indefinite BER lengths are not supported");
  }
  if (count > 4 || i + count > buf.length) {
    throw new Error("Invalid BER length encoding");
  }
  if (buf[i] === 0) {
    throw new Error("Non-canonical BER length encoding");
  }
  let len = 0;
  for (let k = 0; k < count; k++) {
    len = len * 256 + buf[i];
    i += 1;
  }
  if (len < 0x80) {
    throw new Error("Non-canonical BER length encoding");
  }
  return { len, next: i };
};

const isConstructed = (tag: string): boolean => tag === "61" || tag === "63";

export const decodeTlvValue = (
  tag: string,
  value: Uint8Array,
  length: number
): TlvNode => {
  const name = TAG_NAMES[tag];
  const node: TlvNode = { tag, name, length };
  if (!isConstructed(tag)) {
    node.value_hex = bytesToHex(value);
    if (tag === "5A" || tag === "9F25") {
      node.value_bcd = decodeBcd(value);
    }
    const ascii = decodeAscii(value);
    if (ascii !== undefined && ascii.length > 0) {
      node.value_ascii = ascii;
    }
    if (tag === "9F74" || tag === "9F7A" || tag === "9F7B") {
      node.value_b64 = btoa(
        Array.from(value, (byte) => String.fromCharCode(byte)).join("")
      );
    }
  }
  return node;
};

const parseInner = (buf: Uint8Array, depth = 0): TlvNode[] => {
  if (depth > 32) {
    throw new Error("TLV nesting exceeds 32 levels");
  }
  const items: TlvNode[] = [];
  let i = 0;
  while (i < buf.length) {
    const { tag, next: i1 } = parseTag(buf, i);
    const { len, next: i2 } = parseLength(buf, i1);
    if (i2 + len > buf.length) {
      throw new Error("TLV length exceeds available data");
    }
    const v = buf.slice(i2, i2 + len);
    i = i2 + len;
    if (isConstructed(tag)) {
      const children = parseInner(v, depth + 1);
      items.push({ tag, name: TAG_NAMES[tag], length: len, children });
      continue;
    }
    items.push(decodeTlvValue(tag, v, len));
  }
  return items;
};

export const parseBerTlv = (bytes: Uint8Array): TlvNode[] => parseInner(bytes);

export const fromBase64 = (s: string): Uint8Array => {
  if (!BASE64_RE.test(s)) {
    throw new Error("Invalid base64 encoding");
  }
  return Uint8Array.from(atob(s), (character) => character.charCodeAt(0));
};
export const fromHex = (s: string): Uint8Array => hexToBytes(s);
export const toHex = (b: Uint8Array): string => bytesToHex(b);

export type CpmEncoding = "auto" | "base64" | "hex";

// User-provided example payload.
export const CPM_SAMPLE =
  "hQVDUFYwMWGCAXZPB6AAAAYCICBQB1FSSVNDUE1aCpNgARIQAGWAcJ9fIAxBVUxJQSBYWFhYWFhfLQRpZGVuX1AWbWFpbHRvOmluYm94QGdtYWlsLmNvbZ8lAgcJY4IBIJ90JTI2MDkzMDExMTIzNzAwMTIxNjAwMTcwNjYyODExMjgwMDcxODefeoGxF1Z14qy5i2R0k51IDGaNvpencIj95LyTUmQk1d1f+5Qkrp1DNiIfmy08ZhNOQZWaGEiAViRJ/Smqcjsgh+MaKTRwcKY/ebRuJpWJ/QAlmjOgxud5I0mo1i6FuvEbX3gkjHXMIWQd/SGob1cKdgdBnaeaxdkqHNbJl0111GhZ5pcpTvI+XBarfBycn+JDP2+ZV6h4RKjQDBo+4fFo+n7jy53CWMo0U8XrAdbwjtoqXq0Dn3tAg+/ov2OdCe/aMGVp6ELl6ia109/yHEh3eKuOSkvombwdZC653UY7khzoWtk25STlmu6EDSdEI8y1Nbv6SutE8Q==";
export const CPM_SAMPLE_HEX = toHex(fromBase64(CPM_SAMPLE));

export function parseCpm(source: string, encoding: CpmEncoding) {
  const input = source.trim();
  if (!input || input.length > 131_072) {
    throw new Error("Payload must contain between 1 and 131072 characters");
  }
  const autoEncoding =
    HEX_RE.test(input) && input.length % 2 === 0 ? "hex" : "base64";
  const detectedEncoding = encoding === "auto" ? autoEncoding : encoding;
  const bytes = detectedEncoding === "hex" ? fromHex(input) : fromBase64(input);
  const tlv = parseBerTlv(bytes);
  return {
    tlv,
    hex: toHex(bytes),
    base64: btoa(
      Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")
    ),
    byteLength: bytes.length,
    profileMatches:
      tlv.some((node) => node.tag === "85" && node.value_ascii === "CPV01") &&
      tlv.some((node) => node.tag === "61"),
  };
}
