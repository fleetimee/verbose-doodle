export type DateInputMode =
  | "auto"
  | "iso-8601"
  | "unix-milliseconds"
  | "unix-seconds";

type DetectedDateInputMode = Exclude<DateInputMode, "auto">;

export type DateConversionRequest = {
  readonly input: string;
  readonly inputMode: DateInputMode;
  readonly nowMilliseconds?: number;
  readonly timeZone: string;
};

export type DateConversionResult = {
  readonly detectedMode: DetectedDateInputMode;
  readonly iso8601: string;
  readonly relativeTime: string;
  readonly rfc2822: string;
  readonly unixMilliseconds: string;
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
const LEADING_SIGN_PATTERN = /^[+-]/;
const MAX_DATE_MILLISECONDS = 8_640_000_000_000_000;

function detectInputMode(input: string): DetectedDateInputMode {
  if (!INTEGER_PATTERN.test(input)) {
    return "iso-8601";
  }
  const digitCount = input.replace(LEADING_SIGN_PATTERN, "").length;
  return digitCount <= 10 ? "unix-seconds" : "unix-milliseconds";
}

function parseInput(input: string, mode: DetectedDateInputMode) {
  if (mode === "iso-8601") {
    if (!ISO_OFFSET_PATTERN.test(input)) {
      throw new DateConversionError(
        "missing-iso-offset",
        "ISO 8601 input must include Z or an explicit UTC offset."
      );
    }
    const match = ISO_DATE_TIME_PATTERN.exec(input);
    if (!(match && hasValidIsoParts(match))) {
      throw new DateConversionError(
        "invalid-input",
        "Enter a valid ISO 8601 calendar date and time."
      );
    }
    const milliseconds = Date.parse(input);
    if (Number.isNaN(milliseconds)) {
      throw new DateConversionError(
        "invalid-input",
        "Enter a valid ISO 8601 date and time."
      );
    }
    return milliseconds;
  }

  if (!INTEGER_PATTERN.test(input)) {
    throw new DateConversionError(
      "invalid-input",
      "Unix timestamps must contain whole numbers only."
    );
  }

  const value = Number(input);
  const milliseconds = mode === "unix-seconds" ? value * 1000 : value;
  if (
    !Number.isSafeInteger(milliseconds) ||
    Math.abs(milliseconds) > MAX_DATE_MILLISECONDS
  ) {
    throw new DateConversionError(
      "out-of-range",
      "The timestamp falls outside JavaScript's supported date range."
    );
  }
  return milliseconds;
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

function validateTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch (error) {
    // biome-ignore lint/style/useErrorCause: DateConversionError forwards the cause through its constructor.
    throw new DateConversionError(
      "invalid-timezone",
      `Unknown IANA timezone: ${timeZone}`,
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
    return "now";
  }

  const unit =
    RELATIVE_UNITS.find(
      (candidate) => absoluteDifference >= candidate.milliseconds
    ) ?? RELATIVE_UNITS.at(-1);
  if (!unit) {
    return "now";
  }
  const value = Math.round(absoluteDifference / unit.milliseconds);
  const quantity = `${value} ${unit.name}${value === 1 ? "" : "s"}`;
  return difference < 0 ? `${quantity} ago` : `in ${quantity}`;
}

export function convertDate({
  input,
  inputMode,
  nowMilliseconds = Date.now(),
  timeZone,
}: DateConversionRequest): DateConversionResult {
  const normalizedInput = input.trim();
  if (!normalizedInput) {
    throw new DateConversionError("empty-input", "Enter a date or timestamp.");
  }
  validateTimeZone(timeZone);

  const detectedMode =
    inputMode === "auto" ? detectInputMode(normalizedInput) : inputMode;
  const milliseconds = parseInput(normalizedInput, detectedMode);
  const date = new Date(milliseconds);

  return {
    detectedMode,
    iso8601: date.toISOString(),
    relativeTime: formatRelativeTime(milliseconds, nowMilliseconds),
    rfc2822: date.toUTCString(),
    unixMilliseconds: String(milliseconds),
    unixSeconds: String(milliseconds / 1000),
    zonedDateTime: formatZonedDateTime(date, timeZone),
  };
}
