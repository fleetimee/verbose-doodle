const timeZone = "Asia/Jakarta";
const clockFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone,
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});

export function formatChatTime(value: string): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : clockFormatter.format(date);
}

const dayFormatter = new Intl.DateTimeFormat("en-CA", {
  timeZone,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

export function getChatDay(value: string | number): string {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : dayFormatter.format(date);
}

export function formatChatDay(
  value: string,
  now: number,
  locale: string,
  labels: { chatToday: string; chatYesterday: string }
) {
  const day = getChatDay(value);
  if (day === getChatDay(now)) {
    return labels.chatToday;
  }
  if (day === getChatDay(now - 86_400_000)) {
    return labels.chatYesterday;
  }
  return day
    ? new Intl.DateTimeFormat(locale, {
        timeZone,
        day: "numeric",
        month: "long",
        year: "numeric",
      }).format(new Date(value))
    : value;
}
