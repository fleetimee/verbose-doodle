import { queryClient } from "@/lib/query-client";
import { createMutationHook } from "@/lib/query-hooks";

const SIMULATED_API_DELAY_MS = 500;

type DeactivateResponseRequest = {
  endpointId: string;
  responseId: string;
};

type DeactivateResponseResponse = {
  response_code: string;
  response_desc: string;
  endpoint_id: string;
  response_id: string;
};

async function deactivateResponse(
  data: DeactivateResponseRequest
): Promise<DeactivateResponseResponse> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  return {
    response_code: "00",
    response_desc: "success",
    endpoint_id: data.endpointId,
    response_id: data.responseId,
  };
}

export function useDeactivateResponse() {
  const useMutation = createMutationHook<
    DeactivateResponseResponse,
    DeactivateResponseRequest
  >(deactivateResponse, {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      queryClient.invalidateQueries({
        queryKey: ["endpoints", variables.endpointId],
      });
    },
  });

  return useMutation();
}
