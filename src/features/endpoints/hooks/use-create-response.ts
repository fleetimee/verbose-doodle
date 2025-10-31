import type { EndpointResponse } from "@/features/endpoints/types";
import { queryClient } from "@/lib/query-client";
import { createMutationHook } from "@/lib/query-hooks";

const SIMULATED_API_DELAY_MS = 800;

type CreateResponseRequest = {
  endpointId: string;
  name: string;
  json: string;
  statusCode: number;
  activated: boolean;
};

type CreateResponseResponse = {
  response_code: string;
  response_desc: string;
  response: EndpointResponse;
};

async function createResponse(
  data: CreateResponseRequest
): Promise<CreateResponseResponse> {
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  const newResponse: EndpointResponse = {
    id: crypto.randomUUID(),
    name: data.name,
    json: data.json,
    statusCode: data.statusCode,
    activated: data.activated,
  };

  return {
    response_code: "00",
    response_desc: "success",
    response: newResponse,
  };
}

export function useCreateResponse() {
  const useMutation = createMutationHook<
    CreateResponseResponse,
    CreateResponseRequest
  >(createResponse, {
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["endpoints"] });
      queryClient.invalidateQueries({
        queryKey: ["endpoints", variables.endpointId],
      });
    },
  });

  return useMutation();
}
