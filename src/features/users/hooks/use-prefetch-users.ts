import { useQueryClient } from "@tanstack/react-query";
import { userQueryKeys } from "@/features/users/query-key";
import type { User } from "@/features/users/types";
import { apiGet } from "@/lib/api";
import { getAdminUserList } from "@/lib/api-endpoints";
import { TIME_DURATIONS } from "@/lib/constants";

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

/**
 * Hook to prefetch users list on hover
 * Implements the 100ms rule - prefetches immediately so click feels instantaneous
 */
export function usePrefetchUsers() {
  const queryClient = useQueryClient();

  const prefetchUsers = () => {
    // Prefetch immediately on hover - no delay
    // This ensures when user clicks, data is already cached (< 100ms response)
    queryClient.prefetchQuery({
      queryKey: userQueryKeys.all,
      queryFn: fetchUsers,
      staleTime: TIME_DURATIONS.FIVE_MINUTES,
    });
  };

  return { prefetchUsers };
}
