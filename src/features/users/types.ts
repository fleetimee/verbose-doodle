export type User = {
  id?: string;
  name?: string;
  username: string;
  role: "admin" | "user";
  active: boolean;
  avatar?: string;
};
