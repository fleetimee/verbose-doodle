export type Role = "ADMIN" | "USER";

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
