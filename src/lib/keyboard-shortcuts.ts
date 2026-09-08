const APPLE_PLATFORM_PATTERN = /Mac|iPhone|iPad|iPod/i;
const LETTER_PATTERN = /[A-Z]/;

function getPlatform(): string {
  return typeof navigator === "undefined" ? "" : navigator.platform;
}

export function isMacPlatform(platform = getPlatform()): boolean {
  return APPLE_PLATFORM_PATTERN.test(platform);
}

export function formatOptionShortcut(
  key: string,
  platform = getPlatform()
): string {
  return isMacPlatform(platform) ? `⌥${key}` : `Alt+${key}`;
}

export function formatCommandShortcut(platform = getPlatform()): string {
  return isMacPlatform(platform) ? "⌘K" : "Ctrl+K";
}

export function matchesOptionShortcut(
  event: KeyboardEvent,
  shortcutKey: string
): boolean {
  const normalizedKey = shortcutKey.toUpperCase();
  const expectedCode = LETTER_PATTERN.test(normalizedKey)
    ? `Key${normalizedKey}`
    : `Digit${normalizedKey}`;

  return (
    event.altKey &&
    !(event.ctrlKey || event.metaKey || event.shiftKey) &&
    event.code === expectedCode
  );
}
