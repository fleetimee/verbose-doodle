import { getRefreshToken } from "@/features/auth/utils";
import { apiFetch } from "@/lib/api";

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

/**
 * Refresh the access token using the refresh token
 * @throws Error if no refresh token is available or refresh fails
 */
export async function refreshToken(): Promise<RefreshTokenResult> {
  const refreshTokenValue = getRefreshToken();

  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await apiFetch<RefreshTokenResponse>("/refresh", {
    method: "POST",
    body: JSON.stringify({
      refreshToken: refreshTokenValue,
    }),
  });

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
