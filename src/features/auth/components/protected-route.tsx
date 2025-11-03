import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { usePermissions } from "../hooks/use-permissions";
import type { Role } from "../types";

type ProtectedRouteProps = {
  requiredRole?: Role;
  fallback?: ReactNode;
  redirectTo?: string;
  children: ReactNode;
  currentUserRole?: Role;
};

/**
 * Protects routes by requiring a specific role.
 * Redirects to a fallback route if user doesn't have access.
 *
 * @example
 * <Route
 *   path="/users"
 *   element={
 *     <ProtectedRoute requiredRole="ADMIN" currentUserRole={user?.role}>
 *       <UsersPage />
 *     </ProtectedRoute>
 *   }
 * />
 */
export function ProtectedRoute({
  requiredRole,
  fallback,
  redirectTo = "/",
  children,
  currentUserRole,
}: ProtectedRouteProps) {
  const { hasRole } = usePermissions({ role: currentUserRole });

  // If a specific role is required and user doesn't have it
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate replace to={redirectTo} />;
  }

  return <>{children}</>;
}
