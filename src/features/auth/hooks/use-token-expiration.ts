import { useEffect, useState } from "react";
import { getTokenExpiration } from "@/features/auth/utils";

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
  const [info, setInfo] = useState<TokenExpirationInfo | null>(() => {
    const expiration = getTokenExpiration();
    if (!expiration) {
      return null;
    }

    const remainingMs = expiration - Date.now();
    return {
      remainingMs,
      isExpired: remainingMs <= 0,
      formattedTime: formatRemainingTime(remainingMs),
    };
  });

  useEffect(() => {
    const updateExpiration = () => {
      const expiration = getTokenExpiration();
      if (!expiration) {
        setInfo(null);
        return;
      }

      const remainingMs = expiration - Date.now();
      setInfo({
        remainingMs,
        isExpired: remainingMs <= 0,
        formattedTime: formatRemainingTime(remainingMs),
      });
    };

    updateExpiration();

    const interval = setInterval(updateExpiration, UPDATE_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  return info;
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
