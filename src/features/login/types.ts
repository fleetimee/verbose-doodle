/**
 * Login feature type definitions
 */

export type UserRole = "ADMIN" | "USER";

/**
 * Raw API response from login endpoint
 * Based on backend API: POST /login
 */
type ApiLoginResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    token: string;
  };
};

/**
 * Login response after processing
 * Includes token and role extracted from JWT
 */
export type LoginResponse = {
  responseCode: string;
  responseDesc: string;
  token: string;
  role: UserRole;
};

/**
 * Raw API login response type (exported for use in hooks)
 */
export type { ApiLoginResponse };

/**
 * Authentication user data extracted from JWT token payload
 */
export type AuthUser = {
  user_id: string;
  username: string;
  role: UserRole;
};

/**
 * Login error response
 */
export type LoginError = {
  message: string;
  code?: string;
  status?: number;
};
