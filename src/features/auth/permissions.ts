import type { UserRole } from "@/features/login/types";

/**
 * Permission definitions for different actions in the application
 */
export const PERMISSIONS = {
  // Endpoint permissions
  CREATE_ENDPOINT: ["ADMIN"] as const,
  EDIT_ENDPOINT: ["ADMIN"] as const,
  DELETE_ENDPOINT: ["ADMIN"] as const,
  VIEW_ENDPOINT: ["ADMIN", "USER"] as const,

  // Response permissions
  CREATE_RESPONSE: ["ADMIN"] as const,
  EDIT_RESPONSE: ["ADMIN"] as const,
  DELETE_RESPONSE: ["ADMIN"] as const,
  ACTIVATE_RESPONSE: ["ADMIN"] as const,
  DEACTIVATE_RESPONSE: ["ADMIN"] as const,
  VIEW_RESPONSE: ["ADMIN", "USER"] as const,
} as const;

export type Permission = keyof typeof PERMISSIONS;

/**
 * Check if a user role has a specific permission
 */
export function hasPermission(
  userRole: UserRole | null | undefined,
  permission: Permission
): boolean {
  if (!userRole) {
    return false;
  }

  const allowedRoles = PERMISSIONS[permission] as readonly UserRole[];
  return allowedRoles.includes(userRole);
}

/**
 * Check if user has admin role
 */
export function isAdmin(userRole: UserRole | null | undefined): boolean {
  return userRole === "ADMIN";
}

/**
 * Check if user has user role
 */
export function isUser(userRole: UserRole | null | undefined): boolean {
  return userRole === "USER";
}
