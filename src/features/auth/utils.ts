import { jwtDecode } from "jwt-decode";
import type { AuthUser } from "@/features/login/types";

const TOKEN_STORAGE_KEY = "auth_token";

/**
 * JWT payload structure based on backend specification
 */
type JWTPayload = {
  user_id: string;
  username: string;
  role: "ADMIN" | "USER";
  exp?: number;
};

const MILLISECONDS_PER_SECOND = 1000;

export const AUTH_UNAUTHORIZED_EVENT = "auth:unauthorized";

export function emitUnauthorizedEvent() {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(AUTH_UNAUTHORIZED_EVENT));
}

/**
 * Decode JWT token to extract payload
 * Note: This does NOT verify the signature - only extracts data
 * Server should verify token signature
 */
export function decodeJWT(token: string): AuthUser | null {
  try {
    const decoded = jwtDecode<JWTPayload>(token);

    if (typeof decoded.exp === "number") {
      const expirationTime = decoded.exp * MILLISECONDS_PER_SECOND;

      if (Number.isFinite(expirationTime) && expirationTime <= Date.now()) {
        return null;
      }
    }

    return {
      user_id: decoded.user_id,
      username: decoded.username,
      role: decoded.role,
    };
  } catch {
    // Invalid token format or decoding error
    return null;
  }
}

/**
 * Save JWT token to localStorage
 * Uses localStorage for persistence across browser sessions
 */
export function saveAuthToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  } catch {
    // Silently fail - storage might be unavailable
  }
}

/**
 * Get JWT token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
}

/**
 * Clear JWT token from localStorage
 */
export function clearAuthToken(): void {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

/**
 * Get token expiration time in milliseconds
 * Returns null if token is invalid or doesn't have expiration
 */
export function getTokenExpiration(): number | null {
  try {
    const token = getAuthToken();
    if (!token) {
      return null;
    }

    const decoded = jwtDecode<JWTPayload>(token);
    if (typeof decoded.exp !== "number") {
      return null;
    }

    return decoded.exp * MILLISECONDS_PER_SECOND;
  } catch {
    return null;
  }
}
