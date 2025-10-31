export type User = {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user" | "viewer";
  status: "active" | "inactive" | "pending";
  avatar?: string;
};
