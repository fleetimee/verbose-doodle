import { CronDate, CronExpressionParser } from "cron-parser";
import {
  type CronParseRequest,
  type CronParseResult,
  parseCronExpression,
} from "@/features/developer-tools/tools/cron-parser/parse-cron-expression";
import { messages } from "@/lib/i18n";

export type CronPreview = {
  readonly entries: readonly CronParseResult[];
  readonly nextRuns: readonly Date[];
  readonly normalizedExpression: string;
  readonly timeZone: string;
  readonly currentDate: Date;
};

export function parseCronPreview(request: CronParseRequest): CronPreview {
  const expressions = [
    ...new Set(
      request.expression
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
    ),
  ];
  if (!expressions.length || expressions.length > 12) {
    throw new Error(messages.cronParser.enhancements.expressionLimit);
  }
  const currentDate = request.currentDate ?? new Date();
  const entries = expressions.map((expression) =>
    parseCronExpression({ ...request, expression, currentDate })
  );
  const nextRuns = [
    ...new Set(
      entries.flatMap((entry) => entry.nextRuns.map((date) => date.getTime()))
    ),
  ]
    .sort((left, right) => left - right)
    .slice(0, request.runCount ?? 5)
    .map((time) => new Date(time));
  return {
    entries,
    nextRuns,
    normalizedExpression: entries
      .map((entry) => entry.normalizedExpression)
      .join("\n"),
    timeZone: request.timeZone,
    currentDate,
  };
}

export function readPreviewDate(
  value: string,
  timeZone: string
): Date | undefined {
  return value ? new CronDate(value, timeZone).toDate() : undefined;
}

export function getCalendarRunDays(preview: CronPreview, month: Date): Date[] {
  const days: Date[] = [];
  const count = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  for (let day = 1; day <= count; day += 1) {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const start = new CronDate(dateString, preview.timeZone);
    const end = new CronDate(start);
    end.setEndOfDay();
    const currentDate = new Date(
      Math.max(start.getTime() - 1, preview.currentDate.getTime())
    );
    if (currentDate.getTime() >= end.getTime()) {
      continue;
    }
    if (
      preview.entries.some((entry) =>
        CronExpressionParser.parse(entry.normalizedExpression, {
          currentDate,
          endDate: end.toDate(),
          tz: preview.timeZone,
        }).hasNext()
      )
    ) {
      days.push(date);
    }
  }
  return days;
}

export function getScheduleWarnings(preview: CronPreview): string[] {
  const copy = messages.cronParser.enhancements;
  const warnings: string[] = [];
  const restrictedDates = preview.entries.some((entry) => {
    const interval = CronExpressionParser.parse(entry.normalizedExpression, {
      tz: preview.timeZone,
    });
    return (
      !interval.fields.dayOfMonth.isWildcard &&
      interval.fields.dayOfMonth.values.some((day) => Number(day) >= 29)
    );
  });
  if (restrictedDates) {
    warnings.push(copy.monthWarning);
  }
  if (
    preview.nextRuns.some(
      (date, index) =>
        index > 0 &&
        date.getTime() - (preview.nextRuns[index - 1]?.getTime() ?? 0) < 60_000
    )
  ) {
    warnings.push(copy.frequencyWarning);
  }
  const date = new CronDate(preview.currentDate, preview.timeZone);
  const initialOffset = date.getUTCOffset();
  for (let day = 0; day < 366; day += 1) {
    date.addDay();
    if (date.getUTCOffset() !== initialOffset) {
      warnings.push(copy.offsetWarning);
      break;
    }
  }
  return warnings;
}
