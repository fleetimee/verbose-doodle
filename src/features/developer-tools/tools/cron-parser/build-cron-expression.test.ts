import { describe, expect, test } from "bun:test";
import {
  buildCronExpression,
  type CronSchedule,
  DEFAULT_CRON_SCHEDULE,
} from "@/features/developer-tools/tools/cron-parser/build-cron-expression";
import { parseCronExpression } from "@/features/developer-tools/tools/cron-parser/parse-cron-expression";

describe("buildCronExpression", () => {
  test.each([
    [{ frequency: "minutes", interval: "1" }, "* * * * *"],
    [{ frequency: "minutes", interval: "15" }, "*/15 * * * *"],
    [{ frequency: "hourly", minute: "45" }, "45 * * * *"],
    [{ frequency: "daily", time: "09:30" }, "30 9 * * *"],
    [{ frequency: "weekdays", time: "00:00" }, "0 0 * * 1-5"],
    [{ frequency: "weekly", weekday: "0", time: "23:59" }, "59 23 * * 0"],
    [{ frequency: "monthly", day: "31", time: "09:00" }, "0 9 31 * *"],
  ] satisfies readonly [Partial<CronSchedule>, string][])(
    "generates %j as %s",
    (schedule, expression) => {
      expect(
        buildCronExpression({ ...DEFAULT_CRON_SCHEDULE, ...schedule })
      ).toBe(expression);
    }
  );

  test.each([
    { interval: "7" },
    { interval: "" },
    { frequency: "hourly", minute: "60" },
    { frequency: "hourly", minute: "1.5" },
    { frequency: "daily", time: "24:00" },
    { frequency: "daily", time: "09:60" },
    { frequency: "daily", time: "" },
    { frequency: "weekly", weekday: "7" },
    { frequency: "monthly", day: "0" },
    { frequency: "monthly", day: "32" },
  ] satisfies readonly Partial<CronSchedule>[])(
    "rejects invalid schedule %j",
    (schedule) => {
      expect(() =>
        buildCronExpression({ ...DEFAULT_CRON_SCHEDULE, ...schedule })
      ).toThrow();
    }
  );

  test("monthly schedules skip months without the selected day", () => {
    const expression = buildCronExpression({
      ...DEFAULT_CRON_SCHEDULE,
      frequency: "monthly",
      day: "31",
    });
    const result = parseCronExpression({
      expression,
      timeZone: "UTC",
      currentDate: new Date("2026-02-01T00:00:00Z"),
    });
    expect(result.nextRuns[0]?.toISOString()).toBe("2026-03-31T09:00:00.000Z");
  });
});
