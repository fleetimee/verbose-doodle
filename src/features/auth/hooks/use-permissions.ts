import type { Role } from "../types";

// Define what each role can do based on Option 1 RBAC plan
export const ROLE_ABILITIES = {
  ADMIN: {
    // Dynamic Endpoints
    canAccessEndpoints: true,

    // Configuration
    canViewEndpoints: true,
    canAddEndpoint: true,
    canAddResponse: true,
    canActivateResponse: true,

    // User Management
    canViewUsers: true,
    canCreateUser: true,
    canUpdateUser: true,
    canDeleteUser: true,
  },
  USER: {
    // Dynamic Endpoints
    canAccessEndpoints: true,

    // Configuration
    canViewEndpoints: true, // Read-only
    canAddEndpoint: false,
    canAddResponse: false,
    canActivateResponse: false,

    // User Management
    canViewUsers: false,
    canCreateUser: false,
    canUpdateUser: false,
    canDeleteUser: false,
  },
} as const;

export type Ability = keyof (typeof ROLE_ABILITIES)["ADMIN"];

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
