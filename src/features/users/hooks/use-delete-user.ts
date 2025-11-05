import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { apiDelete } from "@/lib/api";
import { getUserDeleteUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";
import { userQueryKeys } from "../queryKey";

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

type ResponseError = {
  message: string;
  code?: string;
  status?: number;
};

/**
 * Delete User API call
 * Makes DELETE request to backend to remove an existing user
 */
async function deleteUser({ user_id }: DeleteUserRequest): Promise<DeleteUserResponse> {
  try {
    const apiResponse = await apiDelete<ApiDeleteUserResponse>(getUserDeleteUrl(user_id));

    if (!apiResponse.responseCode) {
      throw {
        message: "Invalid response structure from server",
        code: "INVALID_RESPONSE",
        status: 500,
      } as ResponseError;
    }

    return {
      responseCode: apiResponse.responseCode,
      responseDesc: apiResponse.responseDesc,
    };
  } catch (error) {
    throw error as ResponseError;
  }
}

/**
 * React Query mutation hook for deleting a user
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<DeleteUserResponse, DeleteUserRequest, ResponseError>(
    deleteUser,
    {
      onSuccess: () => {
        toast.success("User deleted successfully");

        queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      },
      onError: (error) => {
        toast.error("Failed to delete user", {
          description: error.message || "An unexpected error occurred",
        });
      },
    }
  );

  return mutation();
}
