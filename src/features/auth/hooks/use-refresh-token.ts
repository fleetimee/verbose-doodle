import { useAuth } from "@/features/auth/context";
import { getRefreshToken } from "@/features/auth/utils";
import { apiFetch } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

type RefreshTokenResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    accessToken: string;
    refreshToken: string;
    tokenType: string;
    expiresIn: number;
  };
};

export type RefreshTokenResult = {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresIn: number;
};

export type RefreshTokenError = {
  message: string;
  code?: string;
};

/**
 * Refresh token mutation function
 * Makes API call to refresh the access token
 * This is exported for use in non-React contexts (e.g., AuthContext)
 */
export async function refreshToken(): Promise<RefreshTokenResult> {
  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await apiFetch<RefreshTokenResponse>(
    API_ENDPOINTS.auth.refresh,
    {
      method: "POST",
      body: JSON.stringify({
        refreshToken: refreshTokenValue,
      }),
    }
  );

  if (response.responseCode !== "00") {
    throw new Error(response.responseDesc || "Failed to refresh token");
  }

  return {
    accessToken: response.data.accessToken,
    refreshToken: response.data.refreshToken,
    tokenType: response.data.tokenType,
    expiresIn: response.data.expiresIn,
  };
}

/**
 * Custom hook for refreshing authentication tokens
 * Uses TanStack Query mutation for state management
 * Integrates with AuthContext to update stored tokens
 *
 * @example
 * ```tsx
 * const { mutate: refresh, isPending } = useRefreshToken();
 *
 * const handleRefresh = () => {
 *   refresh();
 * };
 * ```
 */
export function useRefreshToken() {
  const { login: setAuthUser } = useAuth();

  const mutation = createMutationHook<
    RefreshTokenResult,
    void,
    RefreshTokenError
  >(refreshToken, {
    onSuccess: (data) => {
      // Update auth context with new tokens
      setAuthUser(data.accessToken, data.refreshToken);
    },
    onError: () => {
      // Token refresh failed - the auth context will handle the logout
      // Error is automatically handled by TanStack Query
    },
  });

  return mutation();
}
