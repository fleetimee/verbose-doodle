import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { EndpointError } from "@/features/endpoints/types";
import { apiDelete } from "@/lib/api";
import { getEndpointTrafficLogsClearUrl } from "@/lib/api-endpoints";
import { messages } from "@/lib/i18n";
import { createMutationHook } from "@/lib/query-hooks";

type ClearEndpointTrafficLogsRequest = {
  readonly endpointId: string;
};

type ApiClearEndpointTrafficLogsResponse = {
  readonly responseCode?: string;
  readonly responseDesc?: string;
  readonly message?: string;
};

async function clearEndpointTrafficLogs(
  request: ClearEndpointTrafficLogsRequest
): Promise<ApiClearEndpointTrafficLogsResponse> {
  try {
    return await apiDelete<ApiClearEndpointTrafficLogsResponse>(
      getEndpointTrafficLogsClearUrl(request.endpointId)
    );
  } catch (error) {
    throw error as EndpointError;
  }
}

export function useClearEndpointTrafficLogs() {
  const queryClient = useQueryClient();

  const mutation = createMutationHook<
    ApiClearEndpointTrafficLogsResponse,
    ClearEndpointTrafficLogsRequest,
    EndpointError
  >(clearEndpointTrafficLogs, {
    onSuccess: (response, request) => {
      toast.success(messages.endpoints.trafficLogsCleared, {
        description:
          response.responseDesc ||
          response.message ||
          messages.endpoints.trafficLogsRemovedDescription,
      });

      queryClient.invalidateQueries({
        queryKey: ["endpoints", request.endpointId, "traffic-logs"],
      });
    },
    onError: (error) => {
      toast.error(messages.endpoints.trafficLogsClearFailed, {
        description: error.message || messages.common.unexpectedError,
      });
    },
  });

  return mutation();
}
