import { CronExpressionParser } from "cron-parser";
import { parseCronExpression } from "@/features/developer-tools/tools/cron-parser/parse-cron-expression";
import { messages } from "@/lib/i18n";

export type OverlapSchedule = {
  id: string;
  name: string;
  expression: string;
  duration: string;
};
export type ScheduleRun = {
  scheduleId: string;
  name: string;
  start: number;
  end: number;
};
export type ScheduleConflict = {
  left: ScheduleRun;
  right: ScheduleRun;
  start: number;
  end: number;
};
export type OverlapResult = {
  start: number;
  end: number;
  timeZone: string;
  runs: ScheduleRun[];
  conflicts: ScheduleConflict[];
  peak: number;
  activity: { time: number; concurrent: number }[];
};

function generateRuns(
  schedules: readonly OverlapSchedule[],
  start: number,
  end: number,
  timeZone: string
) {
  const copy = messages.scheduleOverlapChecker;
  const runs: ScheduleRun[] = [];
  for (const schedule of schedules) {
    const duration = Number(schedule.duration) * 60_000;
    if (
      !(
        schedule.name.trim() &&
        schedule.duration.trim() &&
        Number.isFinite(duration)
      ) ||
      duration <= 0 ||
      duration > 86_400_000
    ) {
      throw new Error(`${schedule.name || copy.job}: ${copy.invalidJob}`);
    }
    const currentDate = new Date(start - duration);
    try {
      const parsed = parseCronExpression({
        expression: schedule.expression,
        currentDate,
        timeZone,
        runCount: 1,
      });
      const interval = CronExpressionParser.parse(parsed.normalizedExpression, {
        currentDate,
        endDate: new Date(end - 1),
        tz: timeZone,
      });
      while (interval.hasNext()) {
        const runStart = interval.next().getTime();
        if (runStart + duration > start) {
          runs.push({
            scheduleId: schedule.id,
            name: schedule.name.trim(),
            start: runStart,
            end: runStart + duration,
          });
          if (runs.length > 3000) {
            throw new Error(copy.runLimit);
          }
        }
      }
    } catch (error) {
      throw new Error(
        `${schedule.name}: ${error instanceof Error ? error.message : copy.invalidCron}`,
        { cause: error }
      );
    }
  }
  return runs.sort(
    (left, right) => Math.max(left.start, start) - Math.max(right.start, start)
  );
}

export function checkScheduleOverlap({
  schedules,
  start,
  hours,
  timeZone,
}: {
  schedules: readonly OverlapSchedule[];
  start: Date;
  hours: number;
  timeZone: string;
}): OverlapResult {
  const copy = messages.scheduleOverlapChecker;
  const windowStart = start.getTime();
  if (
    !(Number.isFinite(windowStart) && [6, 24, 168].includes(hours)) ||
    schedules.length < 2 ||
    schedules.length > 8
  ) {
    throw new Error(copy.invalidSettings);
  }
  const windowEnd = windowStart + hours * 3_600_000;
  const runs = generateRuns(schedules, windowStart, windowEnd, timeZone);
  const conflicts: ScheduleConflict[] = [];
  let active: ScheduleRun[] = [];
  for (const run of runs) {
    const runStart = Math.max(run.start, windowStart);
    active = active.filter((other) => other.end > runStart);
    for (const other of active) {
      conflicts.push({
        left: other,
        right: run,
        start: runStart,
        end: Math.min(run.end, other.end, windowEnd),
      });
      if (conflicts.length > 5000) {
        throw new Error(copy.conflictLimit);
      }
    }
    active.push(run);
  }
  const events = new Map<number, number>([
    [windowStart, 0],
    [windowEnd, 0],
  ]);
  for (const run of runs) {
    const from = Math.max(run.start, windowStart);
    const to = Math.min(run.end, windowEnd);
    events.set(from, (events.get(from) ?? 0) + 1);
    events.set(to, (events.get(to) ?? 0) - 1);
  }
  let concurrent = 0;
  let peak = 0;
  const activity = [...events]
    .sort(([left], [right]) => left - right)
    .map(([time, delta]) => {
      concurrent += delta;
      peak = Math.max(peak, concurrent);
      return { time, concurrent };
    });
  return {
    start: windowStart,
    end: windowEnd,
    timeZone,
    runs,
    conflicts,
    peak,
    activity,
  };
}
