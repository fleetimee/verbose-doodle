import type { AuthUser } from "@/features/login/types";

const TOKEN_STORAGE_KEY = "auth_token";

/**
 * JWT payload structure based on backend specification
 */
type JWTPayload = {
  user_id: string;
  username: string;
  role: "ADMIN" | "USER";
};

const JWT_PARTS_COUNT = 3;
const HEX_BASE = 16;

/**
 * Decode JWT token to extract payload
 * Note: This does NOT verify the signature - only extracts data
 * Server should verify token signature
 */
export function decodeJWT(token: string): AuthUser | null {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== JWT_PARTS_COUNT) {
      return null;
    }

    // Decode base64url payload (second part)
    const payload = parts[1];
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${`00${c.charCodeAt(0).toString(HEX_BASE)}`.slice(-2)}`)
        .join("")
    );

    const decoded = JSON.parse(jsonPayload) as JWTPayload;

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
