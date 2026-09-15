import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { userQueryKeys } from "@/features/users/query-key";
import { type ApiError, apiDelete } from "@/lib/api";
import { getUserDeleteUrl } from "@/lib/api-endpoints";
import { messages } from "@/lib/i18n";
import { createMutationHook } from "@/lib/query-hooks";

type DeleteUserRequest = {
  user_id: string | number;
};

type ApiDeleteUserResponse = {
  responseCode: string;
  responseDesc: string;
};

type DeleteUserResponse = {
  responseCode: string;
  responseDesc: string;
};

/**
 * Delete User API call
 * Makes DELETE request to backend to remove an existing user
 */
async function deleteUser({
  user_id,
}: DeleteUserRequest): Promise<DeleteUserResponse> {
  try {
    const apiResponse = await apiDelete<ApiDeleteUserResponse>(
      getUserDeleteUrl(user_id)
    );

    if (!apiResponse.responseCode) {
      throw {
        code: "INVALID_RESPONSE",
        message: messages.errors.invalidResponseStructure,
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
 * React Query mutation hook for deleting a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    DeleteUserResponse,
    DeleteUserRequest,
    ApiError
  >(deleteUser, {
    onError: (error) => {
      toast.error(messages.users.deleteFailed, {
        description: error.message || messages.common.unexpectedError,
      });
    },
    onSuccess: () => {
      toast.success(messages.users.deleteSuccess);

      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      // Invalidate overview to update user count statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
  });

  return mutation();
}
