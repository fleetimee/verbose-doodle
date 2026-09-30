import { messages } from "@/lib/i18n";

export const SCHEDULE_FREQUENCIES = [
  "minutes",
  "hourly",
  "daily",
  "weekdays",
  "weekly",
  "monthly",
] as const;

export const MINUTE_INTERVALS = [1, 2, 3, 5, 10, 15, 20, 30] as const;

export type CronSchedule = {
  readonly frequency: (typeof SCHEDULE_FREQUENCIES)[number];
  readonly interval: string;
  readonly minute: string;
  readonly time: string;
  readonly weekday: string;
  readonly day: string;
};

export const DEFAULT_CRON_SCHEDULE: CronSchedule = {
  frequency: "minutes",
  interval: "15",
  minute: "0",
  time: "09:00",
  weekday: "1",
  day: "1",
};

const INTEGER_PATTERN = /^\d+$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;

function readInteger(value: string, min: number, max: number) {
  const number = Number(value);
  if (
    !(INTEGER_PATTERN.test(value) && Number.isInteger(number)) ||
    number < min ||
    number > max
  ) {
    throw new Error(messages.cronParser.builder.invalidSchedule);
  }
  return number;
}

export function buildCronExpression(schedule: CronSchedule): string {
  if (schedule.frequency === "minutes") {
    const interval = readInteger(schedule.interval, 1, 30);
    if (!MINUTE_INTERVALS.some((value) => value === interval)) {
      throw new Error(messages.cronParser.builder.invalidSchedule);
    }
    return interval === 1 ? "* * * * *" : `*/${interval} * * * *`;
  }
  if (schedule.frequency === "hourly") {
    return `${readInteger(schedule.minute, 0, 59)} * * * *`;
  }
  if (!TIME_PATTERN.test(schedule.time)) {
    throw new Error(messages.cronParser.builder.invalidSchedule);
  }
  const [hour, minute] = schedule.time.split(":");
  const prefix = `${readInteger(minute ?? "", 0, 59)} ${readInteger(hour ?? "", 0, 23)}`;
  switch (schedule.frequency) {
    case "weekdays":
      return `${prefix} * * 1-5`;
    case "weekly":
      return `${prefix} * * ${readInteger(schedule.weekday, 0, 6)}`;
    case "monthly":
      return `${prefix} ${readInteger(schedule.day, 1, 31)} * *`;
    default:
      return `${prefix} * * *`;
  }
}
