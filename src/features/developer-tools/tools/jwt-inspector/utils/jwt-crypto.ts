import {
  base64url,
  CompactSign,
  compactVerify,
  errors,
  exportPKCS8,
  exportSPKI,
  generateKeyPair,
  importPKCS8,
  importSPKI,
} from "jose";
import { parseJwt } from "./jwt";

const BASE64URL_PATTERN = /^[A-Za-z0-9_-]+$/;

export const JWT_ALGORITHMS = [
  "HS256",
  "HS384",
  "HS512",
  "RS256",
  "RS384",
  "RS512",
  "PS256",
  "PS384",
  "PS512",
  "ES256",
  "ES384",
  "ES512",
  "EdDSA",
] as const;
export type JwtAlgorithm = (typeof JWT_ALGORITHMS)[number];
export interface JwtKeys {
  encoded: boolean;
  privateKey: string;
  publicKey: string;
  secret: string;
}

export function isSupportedAlgorithm(value: string): value is JwtAlgorithm {
  return JWT_ALGORITHMS.some((algorithm) => algorithm === value);
}

function secretBytes(keys: JwtKeys): Uint8Array {
  if (!keys.secret) {
    throw new Error("Enter a secret.");
  }
  if (keys.encoded) {
    if (!BASE64URL_PATTERN.test(keys.secret) || keys.secret.length % 4 === 1) {
      throw new Error("Secret must be unpadded Base64URL.");
    }
    return base64url.decode(keys.secret);
  }
  return new TextEncoder().encode(keys.secret);
}

export async function createJwtKeys(algorithm: JwtAlgorithm): Promise<JwtKeys> {
  if (algorithm.startsWith("HS")) {
    const bytes = crypto.getRandomValues(
      new Uint8Array(Number(algorithm.slice(2)) / 8)
    );
    return {
      secret: base64url.encode(bytes),
      encoded: true,
      privateKey: "",
      publicKey: "",
    };
  }
  const pair = await generateKeyPair(algorithm, { extractable: true });
  return {
    secret: "",
    encoded: false,
    privateKey: await exportPKCS8(pair.privateKey),
    publicKey: await exportSPKI(pair.publicKey),
  };
}

export async function signJwt(
  header: string,
  payload: string,
  keys: JwtKeys
): Promise<string> {
  const h: unknown = JSON.parse(header);
  const p: unknown = JSON.parse(payload);
  if (
    !h ||
    typeof h !== "object" ||
    Array.isArray(h) ||
    !p ||
    typeof p !== "object" ||
    Array.isArray(p)
  ) {
    throw new Error("Header and payload must be JSON objects.");
  }
  const alg = (h as Record<string, unknown>).alg;
  if (typeof alg !== "string" || !isSupportedAlgorithm(alg)) {
    throw new Error("Unsupported signing algorithm.");
  }
  const key = alg.startsWith("HS")
    ? secretBytes(keys)
    : await importPKCS8(keys.privateKey, alg);
  return new CompactSign(new TextEncoder().encode(JSON.stringify(p)))
    .setProtectedHeader({ ...h, alg })
    .sign(key);
}

export async function verifyJwt(
  token: string,
  keys: JwtKeys
): Promise<boolean> {
  const parsed = parseJwt(token);
  const alg = String(parsed.header.alg);
  if (!(parsed.isValidStructure && isSupportedAlgorithm(alg))) {
    throw new Error("Unsupported or malformed token.");
  }
  const key = alg.startsWith("HS")
    ? secretBytes(keys)
    : await importSPKI(keys.publicKey, alg);
  try {
    await compactVerify(token, key, { algorithms: [alg] });
    return true;
  } catch (error) {
    if (error instanceof errors.JWSSignatureVerificationFailed) {
      return false;
    }
    throw error;
  }
}
