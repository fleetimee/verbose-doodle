const PLUS_REGEX = /\+/g;
const SLASH_REGEX = /\//g;
const EQUAL_SIGN_REGEX = /[=]+$/;
const HYPHEN_REGEX = /-/g;
const UNDERSCORE_REGEX = /_/g;

export interface ParsedJwt {
  readonly header: Record<string, unknown>;
  readonly headerStr: string;
  readonly isValidStructure: boolean;
  readonly payload: Record<string, unknown>;
  readonly payloadStr: string;
  readonly raw: string;
  readonly signatureHex: string;
}

export function base64UrlDecode(str: string): string {
  let base64 = str.replace(HYPHEN_REGEX, "+").replace(UNDERSCORE_REGEX, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  // Decode to binary string, then decode to UTF-8
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

export function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  const base64 = btoa(binary);
  return base64
    .replace(PLUS_REGEX, "-")
    .replace(SLASH_REGEX, "_")
    .replace(EQUAL_SIGN_REGEX, "");
}

export function parseJwt(token: string): ParsedJwt {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return {
      header: {},
      headerStr: "",
      isValidStructure: false,
      payload: {},
      payloadStr: "",
      raw: token,
      signatureHex: "",
    };
  }

  try {
    const headerStr = base64UrlDecode(parts[0]);
    const payloadStr = base64UrlDecode(parts[1]);
    const header = JSON.parse(headerStr) as Record<string, unknown>;
    const payload = JSON.parse(payloadStr) as Record<string, unknown>;

    return {
      header,
      headerStr,
      isValidStructure: true,
      payload,
      payloadStr,
      raw: token,
      signatureHex: parts[2],
    };
  } catch {
    return {
      header: {},
      headerStr: "",
      isValidStructure: false,
      payload: {},
      payloadStr: "",
      raw: token,
      signatureHex: parts[2] || "",
    };
  }
}

export async function signHS256(
  headerAndPayload: string,
  secret: string
): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  const data = encoder.encode(headerAndPayload);

  const key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { hash: { name: "SHA-256" }, name: "HMAC" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign("HMAC", key, data);

  const bytes = new Uint8Array(signature);
  let binary = "";
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(PLUS_REGEX, "-")
    .replace(SLASH_REGEX, "_")
    .replace(EQUAL_SIGN_REGEX, "");
}

export async function verifyHS256(
  token: string,
  secret: string
): Promise<boolean> {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return false;
  }
  const headerAndPayload = `${parts[0]}.${parts[1]}`;
  const providedSignature = parts[2];
  try {
    const expectedSignature = await signHS256(headerAndPayload, secret);
    return expectedSignature === providedSignature;
  } catch {
    return false;
  }
}
