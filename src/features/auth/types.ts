export type Role = "ADMIN" | "USER";

export const ROLE_ABILITIES = {
  ADMIN: {
    // Dynamic Endpoints
    canAccessEndpoints: true,
    canActivateResponse: true,
    canAddBiller: true,
    canAddEndpoint: true,
    canAddResponse: true,
    canCreateUser: true,
    canDeleteUser: true,
    canEditEndpoint: true,
    canUpdateUser: true,

    // Configuration
    canViewEndpoints: true,

    // User Management
    canViewUsers: true,
  },
  USER: {
    // Dynamic Endpoints
    canAccessEndpoints: true,
    canActivateResponse: false,
    canAddBiller: false,
    canAddEndpoint: false,
    canAddResponse: false,
    canCreateUser: false,
    canDeleteUser: false,
    canEditEndpoint: false,
    canUpdateUser: false,

    // Configuration
    canViewEndpoints: true, // Read-only

    // User Management
    canViewUsers: false,
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
