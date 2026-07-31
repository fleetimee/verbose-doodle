import { describe, expect, mock, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import { createInMemoryEndpointAdapter } from "@/features/endpoints/data/in-memory-endpoint-adapter";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { useEndpointTelemetry } from "@/features/endpoints/hooks/use-endpoint-telemetry";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";

function createWrapper(queryClient: QueryClient) {
  return function QueryWrapper({ children }: { readonly children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

function createAdapter() {
  return createInMemoryEndpointAdapter({
    endpoints: [
      {
        id: "1",
        slug: "pln-get-health-a1b2c3",
        method: "GET",
        url: "/health",
        billerSlug: "pln",
        responses: [],
      },
    ],
  });
}

describe("Endpoint data hooks", () => {
  test("expose catalog, workspace, and telemetry seams", () => {
    expect(typeof useEndpointCatalog).toBe("function");
    expect(typeof useEndpointWorkspace).toBe("function");
    expect(typeof useEndpointTelemetry).toBe("function");
  });

  test("refetch the catalog after a catalog mutation", async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
    const adapter = createAdapter();
    const { result } = renderHook(() => useEndpointCatalog(adapter), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.endpoints.data).toHaveLength(1));

    await act(async () => {
      await result.current.createEndpoint.mutateAsync({
        method: "POST",
        url: "/payments",
        billerSlug: "pln",
      });
    });

    await waitFor(() => expect(result.current.endpoints.data).toHaveLength(2));
  });

  test("seeds a workspace from catalog data while refreshing its detail", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const catalogEndpoint = {
      id: "catalog-endpoint",
      slug: "pln-post-catalog-backed-a1b2c3",
      method: "POST" as const,
      url: "/catalog-backed",
      billerSlug: "pln",
      responses: [],
    };
    queryClient.setQueryData(endpointDataQueryKeys.catalog, [catalogEndpoint]);

    const adapter = {
      ...createAdapter(),
      getEndpoint: () => new Promise<null>(() => undefined),
    };
    const { result } = renderHook(
      () => useEndpointWorkspace(catalogEndpoint.slug, adapter),
      { wrapper: createWrapper(queryClient) }
    );

    expect(result.current.endpoint.data).toEqual(catalogEndpoint);
    expect(result.current.endpoint.isFetching).toBe(true);
  });

  test("polls telemetry when a refetch interval is configured", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const adapter = createAdapter();
    const listTrafficLogs = mock(adapter.listTrafficLogs);
    const telemetryAdapter = { ...adapter, listTrafficLogs };

    renderHook(
      () =>
        useEndpointTelemetry(
          "1",
          { includeBody: true, limit: 10, search: "", status: "all" },
          { includeMetrics: false, refetchInterval: 10 },
          telemetryAdapter
        ),
      { wrapper: createWrapper(queryClient) }
    );

    await waitFor(() => {
      expect(listTrafficLogs.mock.calls.length).toBeGreaterThan(1);
    });
  });
});
