/**
 * Login feature type definitions
 */

/**
 * Login response from authentication service
 */
export type LoginResponse = {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    name: string;
  };
  message?: string;
};

/**
 * Authentication user data
 */
export type AuthUser = {
  id: string;
  email: string;
  name: string;
  token: string;
};

/**
 * Login error response
 */
export type LoginError = {
  message: string;
  code?: string;
  status?: number;
};
