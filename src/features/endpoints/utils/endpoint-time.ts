const JAKARTA_TIME_ZONE = "Asia/Jakarta";

const jakartaDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  day: "2-digit",
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  month: "short",
  second: "2-digit",
  timeZone: JAKARTA_TIME_ZONE,
  year: "numeric",
});

const jakartaTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "2-digit",
  hour12: false,
  minute: "2-digit",
  second: "2-digit",
  timeZone: JAKARTA_TIME_ZONE,
});

function getDateTimeParts(timestamp: number) {
  return Object.fromEntries(
    jakartaDateTimeFormatter
      .formatToParts(new Date(timestamp))
      .filter(({ type }) => type !== "literal")
      .map(({ type, value }) => [type, value])
  ) as Record<string, string>;
}

export function formatJakartaTimestamp(value: string): string {
  const timestamp = Date.parse(value);
  if (Number.isNaN(timestamp)) {
    return value;
  }

  const parts = getDateTimeParts(timestamp);
  return `${parts.day} ${parts.month} ${parts.year}, ${parts.hour}:${parts.minute}:${parts.second} WIB`;
}

export function formatJakartaTime(timestamp: number): string {
  if (Number.isNaN(timestamp)) {
    return "-";
  }

  return jakartaTimeFormatter.format(new Date(timestamp));
}
