import { useAuth } from "@/features/auth/context";

/**
 * Legacy combined hook that delegates directly to useAuth.
 * Note: Components should prefer calling useAuth() directly.
 */
export function useAuthPermissions() {
  const auth = useAuth();

  return {
    // Auth state
    user: auth.user,
    isAuthenticated: auth.isAuthenticated,
    login: auth.login,
    logout: auth.logout,

    // Permission checks
    can: auth.can,
    hasRole: auth.hasRole,
    isAdmin: auth.isAdmin,
    isUser: auth.isUser,
    role: auth.role,
  };
}

