import { useEffect } from "react";
import { useAuth } from "@/features/auth/context";
import { getTokenExpiration } from "@/features/auth/utils";

// Refresh token 2 minutes before expiration (same as warning threshold)
const REFRESH_BEFORE_EXPIRY_MS = 120_000;
const CHECK_INTERVAL_MS = 10_000; // Check every 10 seconds

/**
 * Hook to automatically refresh access token before it expires
 * Triggers refresh 2 minutes before token expiration
 */
export function useAutoRefresh() {
  const { authState, refreshAuth } = useAuth();

  useEffect(() => {
    if (!authState.isAuthenticated) {
      return;
    }

    const checkAndRefresh = async () => {
      const expiration = getTokenExpiration();
      if (!expiration) {
        return;
      }

      const timeUntilExpiry = expiration - Date.now();

      // If token expires in less than 2 minutes, refresh it
      if (timeUntilExpiry > 0 && timeUntilExpiry < REFRESH_BEFORE_EXPIRY_MS) {
        await refreshAuth();
      }
    };

    // Check immediately
    checkAndRefresh();

    // Then check periodically
    const interval = setInterval(checkAndRefresh, CHECK_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshAuth]);
}
