import { apiGet } from "@/lib/api";
import { getAdminUserList } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";
import { createQueryHook } from "@/lib/query-hooks";
import type { User } from "../types";
import { userQueryKeys } from "../queryKey";

type ApiUserResponse = {
  userId: number;
  username: string;
  role: "ADMIN" | "USER";
  active: boolean;
};

type ApiResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    users: ApiUserResponse[];
  };
};

async function fetchUsers(): Promise<User[]> {
  const data = await apiGet<ApiResponse>(getAdminUserList());

  return data.data.users.map((apiEndpoint) => ({
    id: apiEndpoint.userId,
    username: apiEndpoint.username,
    role: apiEndpoint.role,
    active: apiEndpoint.active,
  }));
}

export function useGetUsers() {
  const useQuery = createQueryHook<User[]>({
    queryKey: userQueryKeys.all,
    queryFn: fetchUsers,
    options: {
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    },
  });

  return useQuery();
}
