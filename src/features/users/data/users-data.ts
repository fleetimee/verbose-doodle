import type { User } from "@/features/users/types";

export const sampleUsers: User[] = [
  {
    id: "1",
    username: "John Doe",
    role: "ADMIN",
    active: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  },
  {
    id: "2",
    username: "Jane Smith",
    role: "USER",
    active: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
  },
  {
    id: "3",
    username: "Bob Johnson",
    role: "ADMIN",
    active: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Bob",
  },
  {
    id: "4",
    username: "Alice Williams",
    role: "USER",
    active: false,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice",
  },
  {
    id: "5",
    username: "Charlie Brown",
    role: "ADMIN",
    active: true,
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie",
  },
];
