import { useEffect } from "react";
import { useAuth } from "@/features/auth/context";
import { getTokenExpiration } from "@/features/auth/utils";

// Refresh token 3 minutes before expiration (before warning dialog shows)
const REFRESH_BEFORE_EXPIRY_MS = 180_000;
const CHECK_INTERVAL_MS = 10_000; // Check every 10 seconds

/**
 * Hook to automatically refresh access token before it expires
 * Triggers refresh 3 minutes before token expiration
 * Warning dialog shows at 2 minutes as a backup if auto-refresh fails
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

      // If token expires in less than 3 minutes, refresh it
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
