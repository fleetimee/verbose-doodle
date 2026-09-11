import { describe, expect, test } from "bun:test";
import { base64UrlEncode } from "./jwt";
import {
  createJwtKeys,
  isCryptoAvailable,
  JWT_ALGORITHMS,
  signJwt,
  verifyJwt,
} from "./jwt-crypto";

describe("JWT signing presets", () => {
  for (const alg of JWT_ALGORITHMS) {
    test(`${alg} signs, verifies, and rejects a changed payload`, async () => {
      const keys = await createJwtKeys(alg);
      const token = await signJwt(
        JSON.stringify({ alg, typ: "JWT" }),
        '{"sub":"developer","exp":1}',
        keys
      );
      expect(await verifyJwt(token, keys)).toBe(true);
      const parts = token.split(".");
      expect(
        await verifyJwt(
          `${parts[0]}.${base64UrlEncode('{"sub":"changed"}')}.${parts[2]}`,
          keys
        )
      ).toBe(false);
    });
  }
  test("Base64URL secrets are decoded to the original key bytes", async () => {
    const keys = {
      secret: "a-secret-at-least-thirty-two-bytes-long",
      encoded: false,
      privateKey: "",
      publicKey: "",
    };
    const token = await signJwt('{"alg":"HS256"}', '{"sub":"test"}', keys);
    expect(
      await verifyJwt(token, {
        ...keys,
        encoded: true,
        secret: base64UrlEncode(keys.secret),
      })
    ).toBe(true);
    expect(
      await verifyJwt(token, { ...keys, secret: base64UrlEncode(keys.secret) })
    ).toBe(false);
    await expect(
      verifyJwt(token, { ...keys, encoded: true, secret: "bad+base64/" })
    ).rejects.toThrow("Base64URL");
  });
  test("rejects mismatched key types and unsupported algorithms", async () => {
    const keys = await createJwtKeys("ES256");
    await expect(signJwt('{"alg":"RS256"}', "{}", keys)).rejects.toThrow();
    await expect(signJwt('{"alg":"none"}', "{}", keys)).rejects.toThrow(
      "Unsupported"
    );
  });
  test("gracefully bypasses signing and verification in insecure contexts without crypto.subtle", async () => {
    const originalCrypto = globalThis.crypto;
    try {
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        value: {
          getRandomValues: originalCrypto.getRandomValues.bind(originalCrypto),
          // subtle omitted to simulate insecure context
        },
      });

      expect(isCryptoAvailable()).toBe(false);

      const hsKeys = await createJwtKeys("HS256");
      expect(hsKeys.secret).toBeDefined();

      const rsKeys = await createJwtKeys("RS256");
      expect(rsKeys.privateKey).toContain("DEV_MODE_INSECURE_HTTP_BYPASS");

      const token = await signJwt(
        '{"alg":"HS256","typ":"JWT"}',
        '{"sub":"test_insecure"}',
        hsKeys
      );
      expect(token.split(".").length).toBe(3);
      expect(await verifyJwt(token, hsKeys)).toBe(true);
    } finally {
      Object.defineProperty(globalThis, "crypto", {
        configurable: true,
        value: originalCrypto,
      });
    }
  });
});
