const MANUAL_LOGOUT_STORAGE_KEY = "manual_logout";

export function markManualLogout(): void {
  try {
    sessionStorage.setItem(MANUAL_LOGOUT_STORAGE_KEY, "true");
  } catch {
    // Silently fail
  }
}

export function clearManualLogout(): void {
  try {
    sessionStorage.removeItem(MANUAL_LOGOUT_STORAGE_KEY);
  } catch {
    // Silently fail
  }
}

export function hasManualLogout(): boolean {
  try {
    return sessionStorage.getItem(MANUAL_LOGOUT_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}
