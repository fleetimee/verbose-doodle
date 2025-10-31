import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/context";

type ProtectedRouteProps = {
  children: ReactNode;
};

/**
 * Protected route component that redirects to login if user is not authenticated
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { authState } = useAuth();

  if (!authState.isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}
