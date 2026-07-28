import type { EndpointResponse } from "@/features/endpoints/types";

type ResponseActivation = Pick<EndpointResponse, "activated" | "id">;

type EndpointResponses = {
  readonly responses: readonly ResponseActivation[];
};

export function getActiveResponses(
  endpoint: EndpointResponses
): ResponseActivation[] {
  return endpoint.responses.filter((response) => response.activated);
}

export function selectActiveResponse(
  endpoint: EndpointResponses
): ResponseActivation | null {
  return getActiveResponses(endpoint)[0] ?? null;
}
