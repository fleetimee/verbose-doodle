import { getDayOfYear, getISOWeek } from "date-fns";
import { formatMessage, messages } from "@/lib/i18n";

export type DateInputMode =
  | "auto"
  | "iso-8601"
  | "rfc-2822"
  | "sql-datetime"
  | "unix-microseconds"
  | "unix-milliseconds"
  | "unix-nanoseconds"
  | "unix-seconds";

export type DetectedDateInputMode = Exclude<DateInputMode, "auto">;

export type DateConversionRequest = {
  readonly input: string;
  readonly inputMode: DateInputMode;
  readonly nowMilliseconds?: number;
  readonly timeZone: string;
};

export type DateCalendarDetails = {
  readonly day: number;
  readonly dayOfWeek: string;
  readonly dayOfWeekNumber: number;
  readonly dayOfYear: number;
  readonly isLeapYear: boolean;
  readonly isoWeek: number;
  readonly month: number;
  readonly monthName: string;
  readonly timeZoneOffset: string;
  readonly year: number;
};

export type DateConversionResult = {
  readonly calendarDetails: DateCalendarDetails;
  readonly detectedMode: DetectedDateInputMode;
  readonly iso8601: string;
  readonly iso8601Local: string;
  readonly relativeTime: string;
  readonly rfc2822: string;
  readonly sqlDateTime: string;
  readonly unixMicroseconds: string;
  readonly unixMilliseconds: string;
  readonly unixNanoseconds: string;
  readonly unixSeconds: string;
  readonly zonedDateTime: string;
};

export type DateConversionErrorCode =
  | "empty-input"
  | "invalid-input"
  | "invalid-timezone"
  | "missing-iso-offset"
  | "out-of-range";

export class DateConversionError extends Error {
  readonly code: DateConversionErrorCode;

  constructor(code: DateConversionErrorCode, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "DateConversionError";
    this.code = code;
  }
}

const INTEGER_PATTERN = /^[+-]?\d+$/;
const ISO_OFFSET_PATTERN = /(?:Z|[+-]\d{2}:?\d{2})$/i;
const ISO_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-](\d{2}):?(\d{2}))$/i;
const SQL_DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-](\d{2}):?(\d{2}))?$/i;
const RFC_2822_PATTERN =
  /^[A-Za-z]{3},\s+\d{1,2}\s+[A-Za-z]{3}\s+\d{4}\s+\d{2}:\d{2}:\d{2}/i;
const LEADING_SIGN_PATTERN = /^[+-]/;
const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000;

function detectInputMode(input: string): DetectedDateInputMode {
  if (INTEGER_PATTERN.test(input)) {
    const digitCount = input.replace(LEADING_SIGN_PATTERN, "").length;
    if (digitCount <= 10) {
      return "unix-seconds";
    }
    if (digitCount <= 13) {
      return "unix-milliseconds";
    }
    if (digitCount <= 16) {
      return "unix-microseconds";
    }
    return "unix-nanoseconds";
  }

  if (RFC_2822_PATTERN.test(input)) {
    return "rfc-2822";
  }

  if (
    input.includes(" ") &&
    SQL_DATE_TIME_PATTERN.test(input) &&
    !input.includes("T")
  ) {
    return "sql-datetime";
  }

  return "iso-8601";
}

function hasValidIsoParts(match: RegExpExecArray) {
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);
  const second = Number(match[6] ?? "0");
  const offsetHour = Number(match[9] ?? "0");
  const offsetMinute = Number(match[10] ?? "0");
  const leapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    leapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ][month - 1];

  return Boolean(
    daysInMonth &&
      day >= 1 &&
      day <= daysInMonth &&
      hour <= 23 &&
      minute <= 59 &&
      second <= 59 &&
      offsetHour <= 23 &&
      offsetMinute <= 59
  );
}

function parseIsoInput(input: string): number {
  if (!ISO_OFFSET_PATTERN.test(input)) {
    throw new DateConversionError(
      "missing-iso-offset",
      messages.dateConverter.errors.missingIsoOffset
    );
  }
  const match = ISO_DATE_TIME_PATTERN.exec(input);
  if (!(match && hasValidIsoParts(match))) {
    throw new DateConversionError(
      "invalid-input",
      messages.dateConverter.errors.invalidIsoCalendar
    );
  }
  const milliseconds = Date.parse(input);
  if (Number.isNaN(milliseconds)) {
    throw new DateConversionError(
      "invalid-input",
      messages.dateConverter.errors.invalidIsoDateTime
    );
  }
  return milliseconds;
}

function parseSqlInput(input: string): number {
  const normalized = input.trim();
  const isoCandidate = normalized.includes("T")
    ? normalized
    : normalized.replace(" ", "T");
  const withOffset = ISO_OFFSET_PATTERN.test(isoCandidate)
    ? isoCandidate
    : `${isoCandidate}Z`;
  const milliseconds = Date.parse(withOffset);
  if (Number.isNaN(milliseconds)) {
    throw new DateConversionError(
      "invalid-input",
      messages.dateConverter.errors.invalidIsoDateTime
    );
  }
  return milliseconds;
}

function parseRfcInput(input: string): number {
  const milliseconds = Date.parse(input);
  if (Number.isNaN(milliseconds)) {
    throw new DateConversionError(
      "invalid-input",
      messages.dateConverter.errors.invalidIsoDateTime
    );
  }
  return milliseconds;
}

function parseUnixInput(
  input: string,
  mode:
    | "unix-seconds"
    | "unix-milliseconds"
    | "unix-microseconds"
    | "unix-nanoseconds"
): number {
  if (!INTEGER_PATTERN.test(input)) {
    throw new DateConversionError(
      "invalid-input",
      messages.dateConverter.errors.invalidUnix
    );
  }

  if (mode === "unix-seconds") {
    return Number(input) * 1000;
  }
  if (mode === "unix-milliseconds") {
    return Number(input);
  }
  if (mode === "unix-microseconds") {
    try {
      return Number(BigInt(input) / 1000n);
    } catch {
      return Number(input) / 1000;
    }
  }
  try {
    return Number(BigInt(input) / 1_000_000n);
  } catch {
    return Number(input) / 1_000_000;
  }
}

function parseInput(input: string, mode: DetectedDateInputMode): number {
  let milliseconds: number;
  if (mode === "iso-8601") {
    milliseconds = parseIsoInput(input);
  } else if (mode === "rfc-2822") {
    milliseconds = parseRfcInput(input);
  } else if (mode === "sql-datetime") {
    milliseconds = parseSqlInput(input);
  } else {
    milliseconds = parseUnixInput(input, mode);
  }

  if (
    !Number.isSafeInteger(Math.trunc(milliseconds)) ||
    Math.abs(milliseconds) > MAX_DATE_MILLISECONDS
  ) {
    throw new DateConversionError(
      "out-of-range",
      messages.dateConverter.errors.outOfRange
    );
  }
  return milliseconds;
}

function validateTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: DateConversionError forwards the cause through its constructor.
    throw new DateConversionError(
      "invalid-timezone",
      formatMessage(messages.dateConverter.errors.invalidTimezone, {
        timeZone,
      }),
      error
    );
  }
}

function formatZonedDateTime(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    fractionalSecondDigits: 3,
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    timeZoneName: "longOffset",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")} ${values.get("hour")}:${values.get("minute")}:${values.get("second")}.${values.get("fractionalSecond")} ${values.get("timeZoneName")}`;
}

function formatIsoLocal(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    fractionalSecondDigits: 3,
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    timeZoneName: "longOffset",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  const offset = values.get("timeZoneName")?.replace("GMT", "") || "Z";
  const normalizedOffset = offset === "" || offset === "+00:00" ? "Z" : offset;
  return `${values.get("year")}-${values.get("month")}-${values.get("day")}T${values.get("hour")}:${values.get("minute")}:${values.get("second")}.${values.get("fractionalSecond")}${normalizedOffset}`;
}

function formatSqlDateTime(date: Date, timeZone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    day: "2-digit",
    hour: "2-digit",
    hour12: false,
    minute: "2-digit",
    month: "2-digit",
    second: "2-digit",
    timeZone,
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((part) => [part.type, part.value]));
  return `${values.get("year")}-${values.get("month")}-${values.get("day")} ${values.get("hour")}:${values.get("minute")}:${values.get("second")}`;
}

const RELATIVE_UNITS = [
  { milliseconds: 365 * 24 * 60 * 60 * 1000, name: "year" },
  { milliseconds: 30 * 24 * 60 * 60 * 1000, name: "month" },
  { milliseconds: 24 * 60 * 60 * 1000, name: "day" },
  { milliseconds: 60 * 60 * 1000, name: "hour" },
  { milliseconds: 60 * 1000, name: "minute" },
  { milliseconds: 1000, name: "second" },
] as const;

function formatRelativeTime(milliseconds: number, nowMilliseconds: number) {
  const difference = milliseconds - nowMilliseconds;
  const absoluteDifference = Math.abs(difference);
  if (absoluteDifference < 1000) {
    return messages.dateConverter.relativeNow;
  }

  const unit =
    RELATIVE_UNITS.find(
      (candidate) => absoluteDifference >= candidate.milliseconds
    ) ?? RELATIVE_UNITS.at(-1);
  if (!unit) {
    return messages.dateConverter.relativeNow;
  }
  const value = Math.round(absoluteDifference / unit.milliseconds);
  // SAFETY: Relative-unit names map to the localized singular/plural message keys.
  const unitKey =
    `${unit.name}${value === 1 ? "" : "s"}` as keyof typeof messages.dateConverter.relativeUnits;
  const unitLabel = messages.dateConverter.relativeUnits[unitKey];
  return difference < 0
    ? formatMessage(messages.dateConverter.relativeAgo, {
        unit: unitLabel,
        value,
      })
    : formatMessage(messages.dateConverter.relativeIn, {
        unit: unitLabel,
        value,
      });
}

function calculateCalendarDetails(
  date: Date,
  timeZone: string
): DateCalendarDetails {
  const parts = new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "numeric",
    timeZone,
    timeZoneName: "shortOffset",
    weekday: "long",
    year: "numeric",
  }).formatToParts(date);
  const values = new Map(parts.map((p) => [p.type, p.value]));

  const year = Number(values.get("year") ?? date.getUTCFullYear());
  const month = Number(values.get("month") ?? date.getUTCMonth() + 1);
  const day = Number(values.get("day") ?? date.getUTCDate());
  const dayOfWeek = values.get("weekday") ?? "Monday";
  const timeZoneOffset = values.get("timeZoneName") ?? "UTC";

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const monthName = monthNames[month - 1] ?? "January";

  const weekdayMap = new Map<string, number>([
    ["Friday", 5],
    ["Monday", 1],
    ["Saturday", 6],
    ["Sunday", 7],
    ["Thursday", 4],
    ["Tuesday", 2],
    ["Wednesday", 3],
  ]);
  const dayOfWeekNumber = weekdayMap.get(dayOfWeek) ?? 1;

  const dayOfYear = getDayOfYear(date);
  const isoWeek = getISOWeek(date);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);

  return {
    day,
    dayOfWeek,
    dayOfWeekNumber,
    dayOfYear,
    isLeapYear,
    isoWeek,
    month,
    monthName,
    timeZoneOffset,
    year,
  };
}

export function convertDate({
  input,
  inputMode,
  nowMilliseconds = Date.now(),
  timeZone,
}: DateConversionRequest): DateConversionResult {
  const normalizedInput = input.trim();
  if (!normalizedInput) {
    throw new DateConversionError(
      "empty-input",
      messages.dateConverter.errors.emptyInput
    );
  }
  validateTimeZone(timeZone);

  const detectedMode =
    inputMode === "auto" ? detectInputMode(normalizedInput) : inputMode;
  const milliseconds = parseInput(normalizedInput, detectedMode);
  const date = new Date(milliseconds);

  const truncMs = Math.trunc(milliseconds);
  const unixMicros = (BigInt(truncMs) * 1000n).toString();
  const unixNanos = (BigInt(truncMs) * 1_000_000n).toString();

  return {
    calendarDetails: calculateCalendarDetails(date, timeZone),
    detectedMode,
    iso8601: date.toISOString(),
    iso8601Local: formatIsoLocal(date, timeZone),
    relativeTime: formatRelativeTime(milliseconds, nowMilliseconds),
    rfc2822: date.toUTCString(),
    sqlDateTime: formatSqlDateTime(date, timeZone),
    unixMicroseconds: unixMicros,
    unixMilliseconds: String(milliseconds),
    unixNanoseconds: unixNanos,
    unixSeconds: String(milliseconds / 1000),
    zonedDateTime: formatZonedDateTime(date, timeZone),
  };
}
