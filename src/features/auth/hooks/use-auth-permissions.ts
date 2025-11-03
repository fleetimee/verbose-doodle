import { useAuth } from "@/features/auth/context";
import { usePermissions } from "./use-permissions";

/**
 * Combined hook that provides both auth state and permission checks
 * This is the recommended hook to use in most components
 *
 * @example
 * function MyComponent() {
 *   const { user, isAuthenticated, can, isAdmin } = useAuthPermissions();
 *
 *   if (!isAuthenticated) return <LoginPrompt />;
 *
 *   return (
 *     <div>
 *       <h1>Welcome, {user?.username}</h1>
 *       {can("canAddEndpoint") && <AddEndpointButton />}
 *       {isAdmin && <AdminPanel />}
 *     </div>
 *   );
 * }
 */
export function useAuthPermissions() {
  const { authState, login, logout } = useAuth();
  const permissions = usePermissions({ role: authState.user?.role });

  return {
    // Auth state
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    login,
    logout,

    // Permission checks
    can: permissions.can,
    hasRole: permissions.hasRole,
    isAdmin: permissions.isAdmin,
    isUser: permissions.isUser,
    role: permissions.role,
  };
}
