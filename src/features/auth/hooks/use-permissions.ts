import type { Ability, Role } from "@/features/auth/types";
import { ROLE_ABILITIES } from "@/features/auth/types";

export { ROLE_ABILITIES };
export type { Ability };

type UsePermissionsProps = {
  role?: Role;
};

export function usePermissions({ role }: UsePermissionsProps = {}) {
  const isAdmin = role === "ADMIN";
  const isUser = role === "USER";

  const can = (ability: Ability): boolean => {
    if (!role) {
      return false;
    }
    return ROLE_ABILITIES[role][ability];
  };

  const hasRole = (requiredRole: Role): boolean => role === requiredRole;

  return {
    can,
    hasRole,
    isAdmin,
    isUser,
    role,
  };
}

