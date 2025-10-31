/**
 * Login feature type definitions
 */

export type UserRole = "ADMIN" | "USER";

/**
 * Login response from authentication service
 * Based on backend API: POST /login
 */
export type LoginResponse = {
  response_code: string;
  response_desc: string;
  token: string;
  role: UserRole;
};

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
