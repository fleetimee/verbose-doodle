import { Navigate } from "react-router";
import { useAuth } from "@/features/auth/context";

/**
 * Root route redirect component
 * Redirects to /login if not authenticated, otherwise to /dashboard
 */
export function AuthRedirect() {
  const { snapshot } = useAuth();

  if (!snapshot.isAuthenticated) {
    return <Navigate replace to="/login" />;
  }

  return <Navigate replace to="/dashboard" />;
}
