import type { Endpoint, EndpointResponse } from "@/features/endpoints/types";

type ResponseActivation = Pick<EndpointResponse, "activated" | "id">;

type EndpointResponses = {
  readonly responses: readonly ResponseActivation[];
};

export function selectEndpointForBiller(
  endpoints: readonly Pick<Endpoint, "billerSlug" | "id" | "responses">[],
  billerSlug: string,
  rememberedEndpointId?: string
): Pick<Endpoint, "billerSlug" | "id" | "responses"> | undefined {
  const billerEndpoints = endpoints.filter(
    (endpoint) => endpoint.billerSlug === billerSlug
  );

  return (
    billerEndpoints.find((endpoint) => endpoint.id === rememberedEndpointId) ??
    billerEndpoints.find((endpoint) =>
      endpoint.responses.some((response) => response.activated)
    ) ??
    billerEndpoints[0]
  );
}

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
