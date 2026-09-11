import { describe, expect, test } from "bun:test";
import {
  formatClaimTimestamp,
  formatTimeRelative,
  getClaimInfo,
  isKnownClaim,
} from "./jwt-claims";

describe("JWT Claims Utilities", () => {
  test("identifies standard registered claims", () => {
    expect(isKnownClaim("sub")).toBe(true);
    expect(isKnownClaim("iat")).toBe(true);
    expect(isKnownClaim("exp")).toBe(true);
    expect(isKnownClaim("alg")).toBe(true);
    expect(isKnownClaim("typ")).toBe(true);
    expect(isKnownClaim("custom_field")).toBe(false);
  });

  test("retrieves claim definitions with RFC references", () => {
    const sub = getClaimInfo("sub");
    expect(sub?.name).toBe("Subject");
    expect(sub?.description).toContain("whom the token refers to");

    const alg = getClaimInfo("alg", "header");
    expect(alg?.name).toBe("Algorithm");
    expect(alg?.description).toContain("RFC 7515");
  });

  test("formats timestamp claims correctly", () => {
    const nowMs = 1_700_000_000 * 1000;
    // Active exp
    const expFuture = 1_700_003_600; // +1 hour
    const expStatus = formatClaimTimestamp("exp", expFuture, nowMs);
    expect(expStatus?.isValid).toBe(true);
    expect(expStatus?.statusType).toBe("active");
    expect(expStatus?.statusLabel).toContain("Expires in 1h");

    // Expired exp
    const expPast = 1_700_000_000 - 3600; // -1 hour
    const expiredStatus = formatClaimTimestamp("exp", expPast, nowMs);
    expect(expiredStatus?.isValid).toBe(true);
    expect(expiredStatus?.statusType).toBe("expired");
    expect(expiredStatus?.statusLabel).toContain("Expired 1h ago");

    // iat
    const iatPast = 1_700_000_000 - 120; // 2 min ago
    const iatStatus = formatClaimTimestamp("iat", iatPast, nowMs);
    expect(iatStatus?.isValid).toBe(true);
    expect(iatStatus?.statusType).toBe("info");
    expect(iatStatus?.statusLabel).toContain("Issued 2m ago");

    // Non-timestamp claim returns null
    expect(formatClaimTimestamp("sub", "user_123", nowMs)).toBeNull();
  });

  test("formats relative seconds nicely", () => {
    expect(formatTimeRelative(30)).toBe("30s");
    expect(formatTimeRelative(150)).toBe("2m");
    expect(formatTimeRelative(7200)).toBe("2h");
    expect(formatTimeRelative(86_400 * 2 + 3600)).toBe("2d 1h");
  });
});
