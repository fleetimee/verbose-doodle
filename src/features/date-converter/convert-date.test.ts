import { describe, expect, test } from "bun:test";
import {
  convertDate,
  DateConversionError,
} from "@/features/date-converter/convert-date";

describe("convertDate", () => {
  test("converts an auto-detected Unix-seconds value in UTC", () => {
    const result = convertDate({
      input: "0",
      inputMode: "auto",
      nowMilliseconds: 3_600_000,
      timeZone: "UTC",
    });

    expect(result.unixSeconds).toBe("0");
    expect(result.unixMilliseconds).toBe("0");
    expect(result.iso8601).toBe("1970-01-01T00:00:00.000Z");
    expect(result.zonedDateTime).toBe("1970-01-01 00:00:00.000 GMT+00:00");
    expect(result.relativeTime).toBe("1 hour ago");
    expect(result.detectedMode).toBe("unix-seconds");
  });

  test("detects milliseconds and renders them in an IANA timezone", () => {
    const result = convertDate({
      input: "1704067200123",
      inputMode: "auto",
      nowMilliseconds: 1_704_067_200_123,
      timeZone: "Asia/Jakarta",
    });

    expect(result.detectedMode).toBe("unix-milliseconds");
    expect(result.zonedDateTime).toBe("2024-01-01 07:00:00.123 GMT+07:00");
    expect(result.relativeTime).toBe("now");
  });

  test("normalizes an offset ISO date and preserves fractional Unix seconds", () => {
    const result = convertDate({
      input: "2024-01-01T07:00:00.123+07:00",
      inputMode: "iso-8601",
      nowMilliseconds: 1_704_067_200_123 + 2 * 24 * 60 * 60 * 1000,
      timeZone: "UTC",
    });

    expect(result.iso8601).toBe("2024-01-01T00:00:00.123Z");
    expect(result.unixSeconds).toBe("1704067200.123");
    expect(result.rfc2822).toBe("Mon, 01 Jan 2024 00:00:00 GMT");
    expect(result.relativeTime).toBe("2 days ago");
  });

  test("supports explicit negative Unix seconds", () => {
    const result = convertDate({
      input: "-1",
      inputMode: "unix-seconds",
      nowMilliseconds: -1000,
      timeZone: "UTC",
    });

    expect(result.unixMilliseconds).toBe("-1000");
    expect(result.iso8601).toBe("1969-12-31T23:59:59.000Z");
  });

  test("rejects ambiguous dates, malformed timestamps, invalid zones, and overflow", () => {
    const invalidRequests = [
      {
        input: "2024-01-01T12:00:00",
        inputMode: "iso-8601",
        timeZone: "UTC",
      },
      {
        input: "2024-02-30T00:00:00Z",
        inputMode: "iso-8601",
        timeZone: "UTC",
      },
      { input: "12.5", inputMode: "unix-seconds", timeZone: "UTC" },
      { input: "0", inputMode: "auto", timeZone: "Mars/Olympus" },
      {
        input: "9000000000000000",
        inputMode: "unix-milliseconds",
        timeZone: "UTC",
      },
    ] as const;

    for (const request of invalidRequests) {
      expect(() => convertDate(request)).toThrow(DateConversionError);
    }
  });
});
