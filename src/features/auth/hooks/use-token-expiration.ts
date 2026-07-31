import { useEffect, useState } from "react";
import { useAuth } from "@/features/auth/context";

const UPDATE_INTERVAL = 1000;
const MINUTES_PER_HOUR = 60;
const SECONDS_PER_MINUTE = 60;

export type TokenExpirationInfo = {
  remainingMs: number;
  isExpired: boolean;
  formattedTime: string;
};

/**
 * Hook to track JWT token expiration time
 * Updates every second and provides formatted remaining time
 */
export function useTokenExpiration(): TokenExpirationInfo | null {
  const { snapshot } = useAuth();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), UPDATE_INTERVAL);
    return () => clearInterval(interval);
  }, []);

  if (snapshot.expiresAt === null) {
    return null;
  }

  const remainingMs = snapshot.expiresAt - now;
  return {
    formattedTime: formatRemainingTime(remainingMs),
    isExpired: remainingMs <= 0,
    remainingMs,
  };
}

/**
 * Format remaining time in a human-readable format
 * Examples: "2h 30m", "45m 20s", "30s"
 */
function formatRemainingTime(ms: number): string {
  if (ms <= 0) {
    return "Expired";
  }

  const totalSeconds = Math.floor(ms / UPDATE_INTERVAL);
  const hours = Math.floor(
    totalSeconds / (MINUTES_PER_HOUR * SECONDS_PER_MINUTE)
  );
  const minutes = Math.floor(
    (totalSeconds % (MINUTES_PER_HOUR * SECONDS_PER_MINUTE)) /
      SECONDS_PER_MINUTE
  );
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }

  if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  }

  return `${seconds}s`;
}
