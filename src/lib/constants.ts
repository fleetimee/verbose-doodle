/**
 * Time conversion constants for consistent time calculations across the application
 */

export const MILLISECONDS_PER_SECOND = 1000;
export const SECONDS_PER_MINUTE = 60;
export const ONE_MINUTE_MS = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;

const FIVE_MINUTES_MULTIPLIER = 5;
const TEN_MINUTES_MULTIPLIER = 10;

/**
 * Common time durations in milliseconds
 */
export const TIME_DURATIONS = {
  ONE_MINUTE: ONE_MINUTE_MS,
  FIVE_MINUTES: ONE_MINUTE_MS * FIVE_MINUTES_MULTIPLIER,
  TEN_MINUTES: ONE_MINUTE_MS * TEN_MINUTES_MULTIPLIER,
} as const;
