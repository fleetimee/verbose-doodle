export type Role = "ADMIN" | "USER";

export const ROLE_ABILITIES = {
  ADMIN: {
    // Dynamic Endpoints
    canAccessEndpoints: true,

    // Configuration
    canViewEndpoints: true,
    canAddBiller: true,
    canAddEndpoint: true,
    canEditEndpoint: true,
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
    canAddBiller: false,
    canAddEndpoint: false,
    canEditEndpoint: false,
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

export type User = {
  user_id: string;
  username: string;
  role: Role;
  active: boolean;
};

export type AuthTokenPayload = {
  user_id: string;
  role: Role;
  username: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type LoginResponse = {
  response_code: string;
  response_desc: string;
  token: string;
};
