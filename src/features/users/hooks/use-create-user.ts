import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import { userQueryKeys } from "@/features/users/query-key";
import { type ApiError, apiPost } from "@/lib/api";
import { getUserCreateUrl } from "@/lib/api-endpoints";
import { formatMessage, messages } from "@/lib/i18n";
import { createMutationHook } from "@/lib/query-hooks";

export type CreateUserRequest = {
  username: string;
  role: "ADMIN" | "USER";
  active: boolean;
  password: string;
};

type ApiCreateUserResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    user_id: string;
  };
};

type CreateUserResponse = {
  user_id: string;
};

/**
 * Create User API call
 * Makes POST request to backend to create a new user
 */
async function createUser(
  data: CreateUserRequest
): Promise<CreateUserResponse> {
  const apiResponse = await apiPost<
    ApiCreateUserResponse,
    {
      username: string;
      role: "ADMIN" | "USER";
      active: boolean;
      password: string;
    }
  >(getUserCreateUrl(), {
    active: data.active,
    password: data.password,
    role: data.role,
    username: data.username,
  });

  // Validate that we have the expected response structure
  if (!apiResponse.data) {
    const error: ApiError = {
      code: "INVALID_RESPONSE",
      message: messages.errors.invalidResponseStructure,
      status: 500,
    };
    throw error;
  }

  // Transform API response to internal format
  return {
    user_id: apiResponse.data.user_id,
  };
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    CreateUserResponse,
    CreateUserRequest,
    ApiError
  >(createUser, {
    onError: (error) => {
      // Handle errors with toast notification
      toast.error(messages.users.createFailed, {
        description: error.message || messages.common.unexpectedError,
      });
    },
    onSuccess: (data) => {
      // Show success message
      toast.success(messages.users.createSuccess, {
        description: formatMessage(messages.users.createSuccessDescription, {
          userId: data.user_id,
        }),
      });

      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
      // Invalidate overview to update user count statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
    },
  });

  return mutation();
}
