import { describe, expect, test } from "bun:test";
import {
  CronParseError,
  parseCronExpression,
} from "@/features/cron-parser/parse-cron-expression";

describe("parseCronExpression", () => {
  test("explains a five-field Unix expression and returns the next five runs", () => {
    const result = parseCronExpression({
      currentDate: new Date("2026-01-05T08:59:00.000Z"),
      expression: "*/15 9-17 * JAN,MAR MON-FRI",
      timeZone: "UTC",
    });

    expect(result.mode).toBe("five-field");
    expect(result.normalizedExpression).toBe("*/15 9-17 * JAN,MAR MON-FRI");
    expect(result.description).toContain("Every 15 minutes");
    expect(result.fields.map((field) => field.key)).toEqual([
      "minute",
      "hour",
      "dayOfMonth",
      "month",
      "dayOfWeek",
    ]);
    expect(result.nextRuns.map((date) => date.toISOString())).toEqual([
      "2026-01-05T09:00:00.000Z",
      "2026-01-05T09:15:00.000Z",
      "2026-01-05T09:30:00.000Z",
      "2026-01-05T09:45:00.000Z",
      "2026-01-05T10:00:00.000Z",
    ]);
  });

  test("treats the first field as seconds in a six-field expression", () => {
    const result = parseCronExpression({
      currentDate: new Date("2026-07-14T00:00:00.000Z"),
      expression: "30 */10 * * * *",
      timeZone: "UTC",
    });

    expect(result.mode).toBe("six-field");
    expect(result.fields[0]).toMatchObject({ key: "second", token: "30" });
    expect(result.nextRuns.map((date) => date.toISOString())).toEqual([
      "2026-07-14T00:00:30.000Z",
      "2026-07-14T00:10:30.000Z",
      "2026-07-14T00:20:30.000Z",
      "2026-07-14T00:30:30.000Z",
      "2026-07-14T00:40:30.000Z",
    ]);
  });

  test("calculates occurrences in the selected IANA timezone", () => {
    const result = parseCronExpression({
      currentDate: new Date("2026-07-14T00:00:00.000Z"),
      expression: "0 9 * * *",
      timeZone: "Asia/Jakarta",
    });

    expect(result.nextRuns[0]?.toISOString()).toBe("2026-07-14T02:00:00.000Z");
  });

  test("handles a daylight-saving transition in the selected timezone", () => {
    const result = parseCronExpression({
      currentDate: new Date("2026-03-07T12:00:00.000Z"),
      expression: "30 2 * * *",
      timeZone: "America/New_York",
    });

    expect(
      result.nextRuns.slice(0, 3).map((date) => date.toISOString())
    ).toEqual([
      "2026-03-08T07:30:00.000Z",
      "2026-03-09T06:30:00.000Z",
      "2026-03-10T06:30:00.000Z",
    ]);
  });

  test("accepts lowercase names and treats both 0 and 7 as Sunday", () => {
    const currentDate = new Date("2026-07-18T12:00:00.000Z");
    const namedResult = parseCronExpression({
      currentDate,
      expression: "0 9 * jul sun",
      timeZone: "UTC",
    });
    const zeroResult = parseCronExpression({
      currentDate,
      expression: "0 9 * * 0",
      timeZone: "UTC",
    });
    const sevenResult = parseCronExpression({
      currentDate,
      expression: "0 9 * * 7",
      timeZone: "UTC",
    });

    expect(namedResult.nextRuns[0]?.toISOString()).toBe(
      "2026-07-19T09:00:00.000Z"
    );
    expect(zeroResult.nextRuns[0]?.toISOString()).toBe(
      sevenResult.nextRuns[0]?.toISOString()
    );
  });

  test("returns the next occurrence strictly after the reference time", () => {
    const result = parseCronExpression({
      currentDate: new Date("2026-07-14T09:00:00.000Z"),
      expression: "0 9 * * *",
      timeZone: "UTC",
    });

    expect(result.nextRuns[0]?.toISOString()).toBe("2026-07-15T09:00:00.000Z");
  });

  test("rejects unsupported extensions and malformed expressions", () => {
    const invalidExpressions = [
      "",
      "* * * *",
      "* * * * * * *",
      "0 0 ? * MON-FRI",
      "0 0 L * *",
      "0 0 1W * *",
      "0 0 * * MON#2",
      "H * * * *",
      "@daily",
      "*/0 * * * *",
      "0 0 * * * 2027",
      "61 * * * *",
    ];

    for (const expression of invalidExpressions) {
      expect(() =>
        parseCronExpression({ expression, timeZone: "UTC" })
      ).toThrow(CronParseError);
    }
  });
});
