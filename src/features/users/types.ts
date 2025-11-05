export type User = {
  id?: string | number;
  name?: string;
  username: string;
  role: "ADMIN" | "USER";
  active: boolean;
  avatar?: string;
};
