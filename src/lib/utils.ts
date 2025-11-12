import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates a UUID using crypto.randomUUID() if available,
 * otherwise falls back to a custom implementation
 */
export function generateUUID(): string {
  // Check if crypto.randomUUID is available
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }

  // Fallback implementation for browsers that don't support crypto.randomUUID
  // This uses a v4 UUID format
  const HEX_BASE = 16;
  const UUID_VARIANT_MASK = 0x3;
  const UUID_VARIANT_VALUE = 0x8;

  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const randomValue = Math.floor(Math.random() * HEX_BASE);
    const value =
      c === "x"
        ? randomValue
        : // biome-ignore lint/suspicious/noBitwiseOperators: Bitwise AND is required for UUID v4 variant field generation
          (randomValue & UUID_VARIANT_MASK) + UUID_VARIANT_VALUE;
    return value.toString(HEX_BASE);
  });
}
