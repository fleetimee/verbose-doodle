import { describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import type { EndpointDataAdapter } from "@/features/endpoints/data/endpoint-data-adapter";
import { ENDPOINT_MUTATION_KEY } from "@/features/endpoints/data/endpoint-mutation-key";
import { useEndpointTelemetry } from "@/features/endpoints/hooks/use-endpoint-telemetry";

const adapter = {
  clearTrafficLogs: () =>
    new Promise<void>((resolve) => {
      resolveClearTrafficLogs = resolve;
    }),
} as unknown as EndpointDataAdapter;

let resolveClearTrafficLogs: (() => void) | null = null;

function createWrapper(queryClient: QueryClient) {
  return function QueryClientWrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("useEndpointTelemetry", () => {
  test("marks traffic-log clearing as an endpoint mutation", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    const { result } = renderHook(
      () =>
        useEndpointTelemetry(
          "endpoint-1",
          {
            includeBody: true,
            limit: 25,
            search: "",
            status: "all",
          },
          {
            enabled: false,
            includeMetrics: false,
            includeTrafficLogs: false,
          },
          adapter
        ),
      { wrapper: createWrapper(queryClient) }
    );

    act(() => {
      result.current.clearTrafficLogs.mutate("endpoint-1");
    });

    await waitFor(() => {
      expect(
        queryClient.isMutating({ mutationKey: ENDPOINT_MUTATION_KEY })
      ).toBe(1);
    });

    act(() => {
      resolveClearTrafficLogs?.();
    });

    await waitFor(() => {
      expect(
        queryClient.isMutating({ mutationKey: ENDPOINT_MUTATION_KEY })
      ).toBe(0);
    });
  });
});
