import { useAuth } from "@/features/auth/context";
import {
  hasPermission,
  isAdmin,
  type Permission,
} from "@/features/auth/permissions";

/**
 * Hook to check user permissions
 * Returns permission checking functions and user role information
 *
 * @example
 * ```tsx
 * const { can, cannot, isAdmin } = usePermission();
 *
 * if (can("CREATE_ENDPOINT")) {
 *   // Show create endpoint button
 * }
 * ```
 */
export function usePermission() {
  const { authState } = useAuth();
  const userRole = authState.user?.role;

  return {
    /**
     * Check if the current user has a specific permission
     */
    can: (permission: Permission) => hasPermission(userRole, permission),

    /**
     * Check if the current user does NOT have a specific permission
     */
    cannot: (permission: Permission) => !hasPermission(userRole, permission),

    /**
     * Check if the current user is an admin
     */
    isAdmin: isAdmin(userRole),

    /**
     * Get the current user's role
     */
    role: userRole,
  };
}
