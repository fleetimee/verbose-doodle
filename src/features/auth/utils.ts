import type { AuthUser } from "@/features/login/types";

const AUTH_STORAGE_KEY = "auth_user";

export function saveAuthUser(user: AuthUser): void {
  try {
    sessionStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Silently fail - storage might be unavailable
  }
}

export function getAuthUser(): AuthUser | null {
  try {
    const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!stored) {
      return null;
    }
    return JSON.parse(stored) as AuthUser;
  } catch {
    return null;
  }
}

export function clearAuthUser(): void {
  try {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}
