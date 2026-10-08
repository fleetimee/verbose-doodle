import { hmac } from "@noble/hashes/hmac.js";
import { sha256 } from "@noble/hashes/sha2.js";

export type InputEncoding = "utf8" | "hex";
export type SignatureEncoding = "hex" | "base64";
export type HmacErrorCode = "hex" | "unicode" | "size" | "key" | "signature";

export class HmacError extends Error {
  readonly code: HmacErrorCode;

  constructor(code: HmacErrorCode) {
    super(code);
    this.name = "HmacError";
    this.code = code;
  }
}

const MAX_BYTES = 100 * 1024;
const WHITESPACE = /\s/g;
const LONE_SURROGATE = /[\uD800-\uDFFF]/u;
const HEX = /^[\da-f]*$/i;
const BASE64_SIGNATURE = /^[A-Za-z\d+/]{43}=$/;

export function decodeInput(
  value: string,
  encoding: InputEncoding
): Uint8Array<ArrayBuffer> {
  if (value.length > MAX_BYTES * 3) {
    throw new HmacError("size");
  }
  if (encoding === "utf8") {
    if (LONE_SURROGATE.test(value)) {
      throw new HmacError("unicode");
    }
    const bytes = new TextEncoder().encode(value);
    if (bytes.length > MAX_BYTES) {
      throw new HmacError("size");
    }
    return bytes;
  }
  const hex = value.replace(WHITESPACE, "");
  if (hex.length % 2 !== 0 || !HEX.test(hex)) {
    throw new HmacError("hex");
  }
  if (hex.length / 2 > MAX_BYTES) {
    throw new HmacError("size");
  }
  return Uint8Array.from({ length: hex.length / 2 }, (_, index) =>
    Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16)
  );
}

export function encodeSignature(
  bytes: Uint8Array,
  encoding: SignatureEncoding
): string {
  if (encoding === "hex") {
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
      ""
    );
  }
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(""));
}

export function decodeSignature(
  value: string,
  encoding: SignatureEncoding
): Uint8Array<ArrayBuffer> {
  if (value.length > 256) {
    throw new HmacError("signature");
  }
  const normalized = value.replace(WHITESPACE, "");
  if (encoding === "hex") {
    if (normalized.length !== 64 || !HEX.test(normalized)) {
      throw new HmacError("signature");
    }
    return decodeInput(normalized, "hex");
  }
  if (!BASE64_SIGNATURE.test(normalized)) {
    throw new HmacError("signature");
  }
  const decoded = atob(normalized);
  if (btoa(decoded) !== normalized) {
    throw new HmacError("signature");
  }
  return Uint8Array.from(decoded, (character) => character.charCodeAt(0));
}

export async function generateHmac(
  message: Uint8Array<ArrayBuffer>,
  key: Uint8Array<ArrayBuffer>
): Promise<Uint8Array<ArrayBuffer>> {
  if (key.length === 0) {
    throw new HmacError("key");
  }
  const subtle = globalThis.crypto?.subtle;
  if (!subtle) {
    return new Uint8Array(hmac(sha256, key, message));
  }
  const signingKey = await subtle.importKey(
    "raw",
    key,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return new Uint8Array(await subtle.sign("HMAC", signingKey, message));
}

export const EXAMPLE_MESSAGE = "The quick brown fox jumps over the lazy dog";
export const EXAMPLE_KEY = "key";
export const EXAMPLE_SIGNATURE =
  "f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8";
