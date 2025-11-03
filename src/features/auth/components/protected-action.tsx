import type { ReactNode } from "react";
import { useAuth } from "@/features/auth/context";
import type { Ability } from "../hooks/use-permissions";
import { usePermissions } from "../hooks/use-permissions";

type ProtectedActionProps = {
  ability: Ability;
  fallback?: ReactNode;
  children: ReactNode;
};

/**
 * Conditionally renders children based on user's role abilities.
 * Use this to show/hide UI elements based on permissions.
 * Automatically gets the current user's role from auth context.
 *
 * @example
 * <ProtectedAction ability="canAddEndpoint">
 *   <Button>Add Endpoint</Button>
 * </ProtectedAction>
 */
export function ProtectedAction({
  ability,
  fallback = null,
  children,
}: ProtectedActionProps) {
  const { authState } = useAuth();
  const { can } = usePermissions({ role: authState.user?.role });

  if (!can(ability)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
