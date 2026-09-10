import { DEFAULT_LOCALE } from "@/lib/i18n";
import type { Iso8583Field } from "./pack-iso8583";

const DIGITS = /^\d+$/;
const CURRENCIES: Readonly<Record<string, { code: string; decimals: number }>> =
  {
    // This host profile represents IDR amounts in whole rupiah.
    "360": { code: "IDR", decimals: 0 },
    "840": { code: "USD", decimals: 2 },
    "978": { code: "EUR", decimals: 2 },
    "702": { code: "SGD", decimals: 2 },
    "392": { code: "JPY", decimals: 0 },
    "458": { code: "MYR", decimals: 2 },
    "036": { code: "AUD", decimals: 2 },
  };

function readableTime(value: string): string | undefined {
  const hours = Number(value.slice(0, 2));
  const minutes = Number(value.slice(2, 4));
  const seconds = Number(value.slice(4, 6));
  if (hours > 23 || minutes > 59 || seconds > 59) {
    return;
  }
  return `${value.slice(0, 2)}:${value.slice(2, 4)}:${value.slice(4, 6)}`;
}

function readableDate(value: string): string | undefined {
  const month = Number(value.slice(0, 2));
  const day = Number(value.slice(2, 4));
  // These fields omit the year. A leap year allows February 29 without inventing a year.
  const date = new Date(Date.UTC(2000, month - 1, day));
  if (date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) {
    return;
  }
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, {
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

function readableAmount(
  value: string,
  fields: readonly Iso8583Field[]
): string | undefined {
  const currencyField = fields.find(
    (item) => item.number === 49 && item.enabled
  );
  const currency = currencyField && CURRENCIES[currencyField.value];
  if (!currency) {
    return;
  }
  return new Intl.NumberFormat(DEFAULT_LOCALE, {
    style: "currency",
    currency: currency.code,
    currencyDisplay: "code",
    minimumFractionDigits: currency.decimals,
    maximumFractionDigits: currency.decimals,
  }).format(Number(value) / 10 ** currency.decimals);
}

export function formatIso8583FieldValue(
  field: Iso8583Field,
  fields: readonly Iso8583Field[]
): string | undefined {
  const { number, value } = field;
  if (!field.enabled || field.kind !== "n" || !DIGITS.test(value)) {
    return;
  }
  if (number === 4 && value.length === 12) {
    return readableAmount(value, fields);
  }
  if (number === 7 && value.length === 10) {
    const date = readableDate(value.slice(0, 4));
    const time = readableTime(value.slice(4));
    return date && time ? `${date}, ${time}` : undefined;
  }
  if (number === 12 && value.length === 6) {
    return readableTime(value);
  }
  if ([13, 15, 16, 17].includes(number) && value.length === 4) {
    return readableDate(value);
  }
  if (number === 14 && value.length === 4) {
    const month = Number(value.slice(2));
    if (month < 1 || month > 12) {
      return;
    }
    const monthName = new Intl.DateTimeFormat(DEFAULT_LOCALE, {
      month: "long",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(2000, month - 1, 1)));
    return `${monthName} '${value.slice(0, 2)}`;
  }
}
