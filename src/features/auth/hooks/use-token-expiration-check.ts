import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/context";
import { getTokenExpiration } from "@/features/auth/utils";

/**
 * Hook to check if token is already expired on app mount/navigation
 * Redirects to login if token is expired
 */
export function useTokenExpirationCheck() {
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Only check if user is authenticated
    if (!authState.isAuthenticated) {
      return;
    }

    const expiration = getTokenExpiration();

    // If no expiration info or token is expired, logout and redirect
    if (!expiration || expiration <= Date.now()) {
      logout();
      navigate("/login?reason=expired-while-away");
    }
  }, [authState.isAuthenticated, logout, navigate]);
}
