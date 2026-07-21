import { CronExpressionParser } from "cron-parser";
import cronstrue from "cronstrue";

export type CronFieldKey =
  | "second"
  | "minute"
  | "hour"
  | "dayOfMonth"
  | "month"
  | "dayOfWeek";

export type CronFieldResult = {
  readonly key: CronFieldKey;
  readonly label: string;
  readonly range: string;
  readonly token: string;
};

export type CronParseRequest = {
  readonly currentDate?: Date;
  readonly expression: string;
  readonly timeZone: string;
};

export type CronParseResult = {
  readonly description: string;
  readonly fields: readonly CronFieldResult[];
  readonly mode: "five-field" | "six-field";
  readonly nextRuns: readonly Date[];
  readonly normalizedExpression: string;
};

export type CronParseErrorCode =
  | "empty-expression"
  | "invalid-field-count"
  | "unsupported-syntax"
  | "invalid-time-zone"
  | "invalid-expression"
  | "no-occurrences";

export class CronParseError extends Error {
  readonly code: CronParseErrorCode;

  constructor(code: CronParseErrorCode, message: string) {
    super(message);
    this.name = "CronParseError";
    this.code = code;
  }
}

const FIELD_DEFINITIONS: Readonly<Record<CronFieldKey, CronFieldResult>> = {
  second: { key: "second", label: "Second", range: "0-59", token: "" },
  minute: { key: "minute", label: "Minute", range: "0-59", token: "" },
  hour: { key: "hour", label: "Hour", range: "0-23", token: "" },
  dayOfMonth: {
    key: "dayOfMonth",
    label: "Day of month",
    range: "1-31",
    token: "",
  },
  month: {
    key: "month",
    label: "Month",
    range: "1-12 or JAN-DEC",
    token: "",
  },
  dayOfWeek: {
    key: "dayOfWeek",
    label: "Day of week",
    range: "0-7 or SUN-SAT",
    token: "",
  },
};

const FIVE_FIELD_ORDER: readonly CronFieldKey[] = [
  "minute",
  "hour",
  "dayOfMonth",
  "month",
  "dayOfWeek",
];
const SIX_FIELD_ORDER: readonly CronFieldKey[] = [
  "second",
  ...FIVE_FIELD_ORDER,
];
const MONTH_ALIASES = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;
const WEEKDAY_ALIASES = [
  "SUN",
  "MON",
  "TUE",
  "WED",
  "THU",
  "FRI",
  "SAT",
] as const;
const BASIC_FIELD_PATTERN = /^[0-9*/,-]+$/;

function removeAliases(token: string, key: CronFieldKey) {
  let remainder = token.toUpperCase();
  let aliases: readonly string[] = [];
  if (key === "month") {
    aliases = MONTH_ALIASES;
  } else if (key === "dayOfWeek") {
    aliases = WEEKDAY_ALIASES;
  }

  for (const alias of aliases) {
    remainder = remainder.replaceAll(alias, "1");
  }

  return remainder;
}

function validateSupportedSyntax(
  tokens: readonly string[],
  fieldOrder: readonly CronFieldKey[]
) {
  for (const [index, token] of tokens.entries()) {
    const key = fieldOrder[index];
    if (!(key && BASIC_FIELD_PATTERN.test(removeAliases(token, key)))) {
      throw new CronParseError(
        "unsupported-syntax",
        "Use numbers, *, lists, ranges, steps, or month and weekday names."
      );
    }
  }
}

function validateTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
  } catch {
    throw new CronParseError(
      "invalid-time-zone",
      "Choose a supported IANA timezone."
    );
  }
}

export function parseCronExpression({
  currentDate = new Date(),
  expression,
  timeZone,
}: CronParseRequest): CronParseResult {
  const normalizedExpression = expression.trim().replace(/\s+/g, " ");
  if (!normalizedExpression) {
    throw new CronParseError("empty-expression", "Enter a cron expression.");
  }

  const tokens = normalizedExpression.split(" ");
  if (tokens.length !== 5 && tokens.length !== 6) {
    throw new CronParseError(
      "invalid-field-count",
      "Use five fields, or six fields with seconds first."
    );
  }

  const mode = tokens.length === 5 ? "five-field" : "six-field";
  const fieldOrder = mode === "five-field" ? FIVE_FIELD_ORDER : SIX_FIELD_ORDER;
  validateSupportedSyntax(tokens, fieldOrder);
  validateTimeZone(timeZone);

  try {
    const interval = CronExpressionParser.parse(normalizedExpression, {
      currentDate,
      tz: timeZone,
    });
    const nextRuns = interval.take(5).map((cronDate) => cronDate.toDate());
    if (nextRuns.length !== 5) {
      throw new CronParseError(
        "no-occurrences",
        "No upcoming executions were found."
      );
    }

    const descriptionExpression =
      mode === "five-field"
        ? `0 ${normalizedExpression}`
        : normalizedExpression;

    return {
      description: cronstrue.toString(descriptionExpression, {
        use24HourTimeFormat: true,
      }),
      fields: fieldOrder.map((key, index) => ({
        ...FIELD_DEFINITIONS[key],
        token: tokens[index] ?? "",
      })),
      mode,
      nextRuns,
      normalizedExpression,
    };
  } catch (error) {
    if (error instanceof CronParseError) {
      throw error;
    }
    throw new CronParseError(
      "invalid-expression",
      error instanceof Error ? error.message : "The expression is invalid."
    );
  }
}
