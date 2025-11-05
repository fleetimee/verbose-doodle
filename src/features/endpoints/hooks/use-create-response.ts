import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { endpointQueryKeys } from "@/features/endpoints/query-keys";
import { overviewQueryKeys } from "@/features/overview/query-keys";
import type { EndpointResponse } from "@/features/endpoints/types";
import { type ApiError, apiPost } from "@/lib/api";
import { getResponseCreateUrl } from "@/lib/api-endpoints";
import { createMutationHook } from "@/lib/query-hooks";

type CreateResponseRequest = {
  endpointId: string;
  name: string;
  json: string;
  statusCode: number;
};

type ApiCreateResponseResponse = {
  responseCode: string;
  responseDesc: string;
  data: {
    response: {
      id: number;
      endpointId: number;
      json: string;
      statusCode: string;
      activated: string;
      name: string;
    };
  };
};

type CreateResponseResponse = {
  response: EndpointResponse;
};

/**
 * Create response API call
 * Makes POST request to backend to create a new response
 */
async function createResponse(
  data: CreateResponseRequest
): Promise<CreateResponseResponse> {
  try {
    const apiResponse = await apiPost<
      ApiCreateResponseResponse,
      {
        endpointId: number;
        json: string;
        statusCode: string;
        activated: string;
        name: string;
      }
    >(getResponseCreateUrl(), {
      endpointId: Number(data.endpointId),
      json: data.json,
      statusCode: data.statusCode.toString(),
      activated: "0", // Always create responses as inactive by default
      name: data.name,
    });

    // Validate that we have the expected response structure
    if (!apiResponse.data?.response) {
      throw {
        message: "Invalid response structure from server",
        code: "INVALID_RESPONSE",
        status: 500,
      } as ApiError;
    }

    // Transform API response to internal format
    return {
      response: {
        id: apiResponse.data.response.id.toString(),
        name: apiResponse.data.response.name,
        json: apiResponse.data.response.json,
        statusCode: Number(apiResponse.data.response.statusCode),
        activated: apiResponse.data.response.activated === "1",
      },
    };
  } catch (error) {
    throw error as ApiError;
  }
}

/**
 * Custom hook for creating a response
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: createResponse, isPending } = useCreateResponse();
 *
 * const handleSubmit = (data: CreateResponseRequest) => {
 *   createResponse(data);
 * };
 * ```
 */
export function useCreateResponse() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    CreateResponseResponse,
    CreateResponseRequest,
    ApiError
  >(createResponse, {
    onSuccess: (data, variables) => {
      // Show success message
      toast.success("Response created successfully", {
        description: `Created response: ${data.response.name}`,
      });

      // Invalidate and refetch queries to get fresh data from server
      queryClient.invalidateQueries({ queryKey: endpointQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: endpointQueryKeys.detail(variables.endpointId),
      });
      // Invalidate overview to update response count statistics
      queryClient.invalidateQueries({ queryKey: overviewQueryKeys.all });
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
