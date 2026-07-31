import type { User } from "@/features/users/types";

export const sampleUsers: User[] = [
  {
    active: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    id: "1",
    role: "ADMIN",
    username: "John Doe",
  },
  {
    active: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    id: "2",
    role: "USER",
    username: "Jane Smith",
  },
  {
    active: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
    id: "3",
    role: "ADMIN",
    username: "Bob Johnson",
  },
  {
    active: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
    id: "4",
    role: "USER",
    username: "Alice Williams",
  },
  {
    active: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
    id: "5",
    role: "ADMIN",
    username: "Charlie Brown",
  },
];
