import { describe, expect, mock, spyOn, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { toast } from "sonner";
import { endpointDataQueryKeys } from "@/features/endpoints/data/endpoint-data-query-keys";
import { createInMemoryEndpointAdapter } from "@/features/endpoints/data/in-memory-endpoint-adapter";
import { useEndpointCatalog } from "@/features/endpoints/hooks/use-endpoint-catalog";
import { useEndpointTelemetry } from "@/features/endpoints/hooks/use-endpoint-telemetry";
import { useEndpointWorkspace } from "@/features/endpoints/hooks/use-endpoint-workspace";
import type { ApiError } from "@/lib/api";

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
        billerSlug: "pln",
        id: "1",
        method: "GET",
        responses: [],
        slug: "pln-get-health-a1b2c3",
        url: "/health",
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
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const adapter = createAdapter();
    const { result } = renderHook(() => useEndpointCatalog(adapter), {
      wrapper: createWrapper(queryClient),
    });

    await waitFor(() => expect(result.current.endpoints.data).toHaveLength(1));

    await act(async () => {
      await result.current.createEndpoint.mutateAsync({
        billerSlug: "pln",
        method: "POST",
        url: "/payments",
      });
    });

    await waitFor(() => expect(result.current.endpoints.data).toHaveLength(2));
  });

  test("shows one success toast after creating a response", async () => {
    const successToast = spyOn(toast, "success");
    successToast.mockClear();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const { result } = renderHook(
      () => useEndpointWorkspace("pln-get-health-a1b2c3", createAdapter()),
      { wrapper: createWrapper(queryClient) }
    );

    try {
      await waitFor(() => expect(result.current.endpoint.data).toBeDefined());

      await act(async () => {
        await result.current.createResponse.mutateAsync({
          endpointId: "1",
          json: "{}",
          name: "created_response",
          statusCode: 200,
        });
      });

      expect(successToast).toHaveBeenCalledTimes(1);
      expect(successToast).toHaveBeenCalledWith(
        "Response created successfully",
        { description: "Created response: created_response" }
      );
    } finally {
      successToast.mockRestore();
    }
  });

  test("shows one error toast when response creation fails", async () => {
    const errorToast = spyOn(toast, "error");
    errorToast.mockClear();
    const queryClient = new QueryClient({
      defaultOptions: {
        mutations: { retry: false },
        queries: { retry: false },
      },
    });
    const error: ApiError = {
      code: "500",
      message: "Unable to create response",
      status: 500,
    };
    const adapter = {
      ...createAdapter(),
      createResponse: () => {
        throw error;
      },
    };
    const { result } = renderHook(
      () => useEndpointWorkspace("pln-get-health-a1b2c3", adapter),
      { wrapper: createWrapper(queryClient) }
    );

    try {
      await waitFor(() => expect(result.current.endpoint.data).toBeDefined());

      await act(async () => {
        await result.current.createResponse
          .mutateAsync({
            endpointId: "1",
            json: "{}",
            name: "created_response",
            statusCode: 200,
          })
          .catch(() => undefined);
      });

      expect(errorToast).toHaveBeenCalledTimes(1);
      expect(errorToast).toHaveBeenCalledWith("Failed to create response", {
        description: "Unable to create response",
      });
    } finally {
      errorToast.mockRestore();
    }
  });

  test("seeds a workspace from catalog data while refreshing its detail", () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const catalogEndpoint = {
      billerSlug: "pln",
      id: "catalog-endpoint",
      method: "POST" as const,
      responses: [],
      slug: "pln-post-catalog-backed-a1b2c3",
      url: "/catalog-backed",
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
