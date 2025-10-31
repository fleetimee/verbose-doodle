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
  role: UserRole;
};

/**
 * Authentication user data stored in session
 */
export type AuthUser = {
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
