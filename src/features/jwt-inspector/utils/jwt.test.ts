import { describe, expect, test } from "bun:test";
import {
  base64UrlDecode,
  base64UrlEncode,
  parseJwt,
  signHS256,
  verifyHS256,
} from "@/features/jwt-inspector/utils/jwt";

describe("JWT base64url utilities", () => {
  test("encodes and decodes standard string correctly", () => {
    const original = "Hello World!";
    const encoded = base64UrlEncode(original);
    expect(encoded).toBe("SGVsbG8gV29ybGQh");
    expect(base64UrlDecode(encoded)).toBe(original);
  });

  test("encodes and decodes UTF-8 characters correctly", () => {
    const original = "BPDDIY DevTools ☕";
    const encoded = base64UrlEncode(original);
    expect(base64UrlDecode(encoded)).toBe(original);
  });
});

describe("JWT parser utility", () => {
  test("parses a valid JWT structure", () => {
    // Header: {"alg":"HS256","typ":"JWT"}
    const h = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";
    // Payload: {"sub":"1234567890","name":"John Doe","admin":true}
    const p =
      "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9";
    const s = "SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const token = `${h}.${p}.${s}`;

    const parsed = parseJwt(token);
    expect(parsed.isValidStructure).toBe(true);
    expect(parsed.header.alg).toBe("HS256");
    expect(parsed.payload.sub).toBe("1234567890");
    expect(parsed.payload.name).toBe("John Doe");
    expect(parsed.signatureHex).toBe(s);
  });

  test("fails gracefully on invalid structures", () => {
    const badToken1 = "abc.def";
    const parsed1 = parseJwt(badToken1);
    expect(parsed1.isValidStructure).toBe(false);

    const badToken2 = "abc.def.ghi.jkl";
    const parsed2 = parseJwt(badToken2);
    expect(parsed2.isValidStructure).toBe(false);
  });

  test("fails gracefully on malformed JSON parts", () => {
    // Header: "not a json string" -> base64url: bW90IGEgYnNvbiBzdHJpbmc
    const h = "bW90IGEgYnNvbiBzdHJpbmc";
    const p = "eyJzdWIiOiIxMjM0NTY3ODkwIn0";
    const s = "sig";
    const token = `${h}.${p}.${s}`;

    const parsed = parseJwt(token);
    expect(parsed.isValidStructure).toBe(false);
  });
});

describe("JWT crypto utilities (HS256)", () => {
  const secret = "test-secret-key-12345";
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { sub: "user_test", iat: 1_516_239_022 };
  const hEnc = base64UrlEncode(JSON.stringify(header));
  const pEnc = base64UrlEncode(JSON.stringify(payload));
  const hp = `${hEnc}.${pEnc}`;

  test("signs and verifies a valid token successfully", async () => {
    const signature = await signHS256(hp, secret);
    const token = `${hp}.${signature}`;

    const isVerified = await verifyHS256(token, secret);
    expect(isVerified).toBe(true);
  });

  test("fails verification with a wrong secret", async () => {
    const signature = await signHS256(hp, secret);
    const token = `${hp}.${signature}`;

    const isVerified = await verifyHS256(token, "wrong-secret");
    expect(isVerified).toBe(false);
  });

  test("fails verification for a mutated payload", async () => {
    const signature = await signHS256(hp, secret);

    // Mutate the payload slightly
    const mutatedPayload = { sub: "user_mutated", iat: 1_516_239_022 };
    const mpEnc = base64UrlEncode(JSON.stringify(mutatedPayload));
    const mutatedToken = `${hEnc}.${mpEnc}.${signature}`;

    const isVerified = await verifyHS256(mutatedToken, secret);
    expect(isVerified).toBe(false);
  });
});
