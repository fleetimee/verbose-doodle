import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { userQueryKeys } from "@/features/users/query-key";
import { type ApiError, apiPatch } from "@/lib/api";
import { getUserUpdateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

type UpdateUserRequest = {
  user_id: string | number;
  username?: string;
  role?: "ADMIN" | "USER";
  active?: boolean;
};

type ApiUpdateUserResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    user_id: string;
  };
};

type UpdateUserResponse = {
  responseCode: string;
  responseDesc: string;
};

/**
 * Update User API call
 * Makes PATCH request to backend to update an existing user
 */
async function updateUser(
  data: UpdateUserRequest
): Promise<UpdateUserResponse> {
  try {
    const apiResponse = await apiPatch<
      ApiUpdateUserResponse,
      Omit<UpdateUserRequest, "user_id">
    >(getUserUpdateUrl(data.user_id), {
      username: data.username,
      role: data.role,
      active: data.active,
    });

    if (!apiResponse.responseCode) {
      throw {
        message: "Invalid response structure from server",
        code: "INVALID_RESPONSE",
        status: 500,
      } as ApiError;
    }

    return {
      responseCode: apiResponse.responseCode,
      responseDesc: apiResponse.responseDesc,
    };
  } catch (error) {
    throw error as ApiError;
  }
}

/**
 * React Query mutation hook for updating a user
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    UpdateUserResponse,
    UpdateUserRequest,
    ApiError
  >(updateUser, {
    onSuccess: () => {
      toast.success("User updated successfully");

      // Refresh relevant user queries
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      // Invalidate overview to update user statistics (e.g., active/inactive counts)
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
      // queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(data.user_id) });
    },
    onError: (error) => {
      toast.error("Failed to update user", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
