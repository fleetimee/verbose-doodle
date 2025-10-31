import type { User } from "@/features/users/types";

export const sampleUsers: User[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "admin",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com",
    role: "user",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: "3",
    name: "Bob Johnson",
    email: "bob.johnson@example.com",
    role: "viewer",
    status: "inactive",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  },
  {
    id: "4",
    name: "Alice Williams",
    email: "alice.williams@example.com",
    role: "user",
    status: "pending",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  },
  {
    id: "5",
    name: "Charlie Brown",
    email: "charlie.brown@example.com",
    role: "admin",
    status: "active",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  },
];
