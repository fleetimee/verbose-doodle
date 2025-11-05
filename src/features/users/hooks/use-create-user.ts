import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { userQueryKeys } from "@/features/users/query-key";
import { type ApiError, apiPost } from "@/lib/api";
import { getUserCreateUrl } from "@/lib/api-endpoints";
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
  try {
    const apiResponse = await apiPost<
      ApiCreateUserResponse,
      {
        username: string;
        role: "ADMIN" | "USER";
        active: boolean;
        password: string;
      }
    >(getUserCreateUrl(), {
      username: data.username,
      role: data.role,
      active: data.active,
      password: data.password,
    });

    // Validate that we have the expected response structure
    if (!apiResponse.data) {
      throw {
        message: "Invalid response structure from server",
        code: "INVALID_RESPONSE",
        status: 500,
      } as ApiError;
    }

    // Transform API response to internal format
    return {
      user_id: apiResponse.data.user_id,
    };
  } catch (error) {
    throw error as ApiError;
  }
}

export function useCreateUser() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    CreateUserResponse,
    CreateUserRequest,
    ApiError
  >(createUser, {
    onSuccess: (data) => {
      // Show success message
      toast.success("Response created successfully", {
        description: `Created response: ${data.user_id}`,
      });

      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: userQueryKeys.all });
    },
    onError: (error) => {
      // Handle errors with toast notification
      toast.error("Failed to create response", {
        description: error.message || "An unexpected error occurred",
      });
    },
  });

  return mutation();
}
