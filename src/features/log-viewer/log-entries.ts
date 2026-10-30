const LOG_ENTRY_START =
  /^(?:\[(?:\d{2}[/-]\d{2}[/-]\d{4}[ \t]+|\d{4}[/-]\d{2}[/-]\d{2}[ \tT]+)?\d{2}:\d{2}:\d{2}|(?:\d{4}[/-]\d{2}[/-]\d{2}|\d{2}[/-]\d{2}[/-]\d{4})[ \tT]+\d{2}:\d{2}:\d{2}|\d{2}:\d{2}:\d{2}(?:[.,]\d+)?[ \t]+|[A-Z][a-z]{2}[ \t]+\d{1,2}[ \t]+\d{2}:\d{2}:\d{2})/;

export function splitLogEntries(text: string): string[] {
  const lines = text.split("\n");
  if (lines.at(-1) === "") {
    lines.pop();
  }
  const hasTimestampedEntries = lines.some((line) =>
    LOG_ENTRY_START.test(line)
  );
  if (!hasTimestampedEntries) {
    return lines.map((line) => `${line}\n`);
  }
  const entries: string[] = [];
  let current: string[] = [];
  for (const line of lines) {
    if (LOG_ENTRY_START.test(line) && current.length > 0) {
      entries.push(`${current.join("\n")}\n`);
      current = [line];
    } else {
      current.push(line);
    }
  }
  if (current.length > 0) {
    entries.push(`${current.join("\n")}\n`);
  }
  return entries;
}

export function logEntryAt(text: string, offset: number): string {
  let start = 0;
  for (const entry of splitLogEntries(text)) {
    const end = Math.min(text.length, start + entry.length);
    if (offset < end || end === text.length) {
      return text.slice(start, end);
    }
    start = end;
  }
  return "";
}
