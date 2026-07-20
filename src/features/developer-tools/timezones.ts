export function getBrowserTimeZone() {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

export function getTimeZoneOptions(browserTimeZone: string) {
  const supported =
    "supportedValuesOf" in Intl ? Intl.supportedValuesOf("timeZone") : [];
  return [...new Set(["UTC", browserTimeZone, ...supported])].sort((a, b) => {
    if (a === "UTC") {
      return -1;
    }
    if (b === "UTC") {
      return 1;
    }
    return a.localeCompare(b);
  });
}

export function isValidTimeZone(timeZone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

export function resolveTimeZone(
  savedTimeZone: string,
  browserTimeZone: string
) {
  if (isValidTimeZone(savedTimeZone)) {
    return savedTimeZone;
  }
  if (isValidTimeZone(browserTimeZone)) {
    return browserTimeZone;
  }
  return "UTC";
}
