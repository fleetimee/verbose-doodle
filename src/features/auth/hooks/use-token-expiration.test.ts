import { afterEach, beforeEach, describe, expect, test, vi } from "bun:test";
import { renderHook } from "@testing-library/react";
import * as authUtils from "@/features/auth/utils";
import { useTokenExpiration } from "./use-token-expiration";

// Regex patterns for time format matching
const HOURS_MINUTES_PATTERN = /\d+h \d+m/;
const TWO_HOURS_PATTERN = /2h \d+m/;
const MINUTES_PATTERN = /1m/;
const SECONDS_PATTERN = /\d+s/;

describe("useTokenExpiration", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  test("returns null when no token is available", () => {
    vi.spyOn(authUtils, "getTokenExpiration").mockReturnValue(null);

    const { result } = renderHook(() => useTokenExpiration());

    expect(result.current).toBeNull();
  });

  test("returns expiration info when token is available", () => {
    const futureTime = Date.now() + 7_200_000; // 2 hours from now
    vi.spyOn(authUtils, "getTokenExpiration").mockReturnValue(futureTime);

    const { result } = renderHook(() => useTokenExpiration());

    expect(result.current).not.toBeNull();
    expect(result.current?.isExpired).toBe(false);
    expect(result.current?.remainingMs).toBeGreaterThan(0);
    expect(result.current?.formattedTime).toMatch(HOURS_MINUTES_PATTERN);
  });

  test("shows expired when token time has passed", () => {
    const pastTime = Date.now() - 1000; // 1 second ago
    vi.spyOn(authUtils, "getTokenExpiration").mockReturnValue(pastTime);

    const { result } = renderHook(() => useTokenExpiration());

    expect(result.current?.isExpired).toBe(true);
    expect(result.current?.formattedTime).toBe("Expired");
  });

  test("calculates remaining time for 65 seconds", () => {
    const futureTime = Date.now() + 65_000; // 65 seconds from now
    vi.spyOn(authUtils, "getTokenExpiration").mockReturnValue(futureTime);

    const { result } = renderHook(() => useTokenExpiration());

    expect(result.current?.isExpired).toBe(false);
    expect(result.current?.formattedTime).toMatch(MINUTES_PATTERN);
  });

  test("formats time correctly for different durations", () => {
    // Test hours and minutes
    const twoHoursThirtyMinutes = Date.now() + 9_000_000; // 2.5 hours
    vi.spyOn(authUtils, "getTokenExpiration").mockReturnValue(
      twoHoursThirtyMinutes
    );

    const { result: result1 } = renderHook(() => useTokenExpiration());
    expect(result1.current?.formattedTime).toMatch(TWO_HOURS_PATTERN);

    // Test minutes and seconds
    const fortyFiveSeconds = Date.now() + 45_000; // 45 seconds
    vi.spyOn(authUtils, "getTokenExpiration").mockReturnValue(fortyFiveSeconds);

    const { result: result2 } = renderHook(() => useTokenExpiration());
    expect(result2.current?.formattedTime).toMatch(SECONDS_PATTERN);
  });
});
