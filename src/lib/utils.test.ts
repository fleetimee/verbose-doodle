import { describe, expect, test } from "bun:test";
import { generateUUID } from "@/lib/utils";

const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateUUID", () => {
  test("falls back when crypto.randomUUID is unavailable", () => {
    const originalCrypto = Object.getOwnPropertyDescriptor(
      globalThis,
      "crypto"
    );

    Object.defineProperty(globalThis, "crypto", {
      configurable: true,
      value: {},
    });

    try {
      expect(generateUUID()).toMatch(UUID_V4_PATTERN);
    } finally {
      if (originalCrypto) {
        Object.defineProperty(globalThis, "crypto", originalCrypto);
      } else {
        Reflect.deleteProperty(globalThis, "crypto");
      }
    }
  });
});
