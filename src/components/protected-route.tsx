import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/context";
import { usePermissions } from "@/features/auth/hooks/use-permissions";
import type { Role } from "@/features/auth/types";

type ProtectedRouteProps = {
  children: ReactNode;
  requiredRole?: Role;
  redirectTo?: string;
  fallback?: ReactNode;
};

/**
 * Protected route component that:
 * 1. Redirects to login if user is not authenticated
 * 2. Optionally checks for required role and redirects if user doesn't have access
 *
 * @example
 * // Only requires authentication
 * <ProtectedRoute>
 *   <DashboardLayout />
 * </ProtectedRoute>
 *
 * @example
 * // Requires ADMIN role
 * <ProtectedRoute requiredRole="ADMIN" redirectTo="/dashboard">
 *   <UsersPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredRole,
  redirectTo = "/dashboard",
  fallback,
}: ProtectedRouteProps) {
  const { authState } = useAuth();
  const { hasRole } = usePermissions({ role: authState.user?.role });

  // First check: User must be authenticated
  if (!authState.isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  // Second check: If a specific role is required, check it
  if (requiredRole && !hasRole(requiredRole)) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return <Navigate replace to={redirectTo} />;
  }

  return <>{children}</>;
}
