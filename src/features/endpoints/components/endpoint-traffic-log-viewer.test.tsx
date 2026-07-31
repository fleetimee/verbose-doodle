import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router";
import { AuthProvider } from "@/features/auth/context";
import { EndpointTrafficLogViewer } from "@/features/endpoints/components/endpoint-traffic-log-viewer";

const originalFetch = globalThis.fetch;
const TRAFFIC_LOG_LINE_PATTERN = /request_id:req-1/;

const trafficLog = {
  biller_id: "1",
  delay_ms: null,
  destination_ip: null,
  destination_port: null,
  duration_ms: 24,
  endpoint_id: "endpoint-1",
  forwarded_for: null,
  hit_status: "matched_success",
  http_status_code: 200,
  id: "log-1",
  matched: true,
  method: "GET",
  occurred_at: "2026-07-28T10:00:00.000Z",
  path: "/inquiry",
  query_string: null,
  request_body_preview: null,
  request_id: "req-1",
  response_body_preview: "{}",
  response_id: "response-1",
  response_name: "Success",
  simulate_timeout: false,
  source_ip: "127.0.0.1",
  source_port: 5000,
  user_agent: "test-agent",
};

function createAdminToken() {
  const payload = btoa(
    JSON.stringify({ role: "ADMIN", user_id: "user-1", username: "admin" })
  );
  return `header.${payload}.signature`;
}

function jsonResponse(body: unknown) {
  return new Response(JSON.stringify(body), {
    headers: { "Content-Type": "application/json" },
    status: 200,
  });
}

function installApiMock() {
  const mockFetch = (input: Parameters<typeof globalThis.fetch>[0]) => {
    const url = String(input);

    if (url.includes("/traffic-logs/log-1")) {
      return Promise.resolve(
        jsonResponse({
          data: {
            log: {
              ...trafficLog,
              error_message: null,
              request_body: null,
              request_headers: null,
              response_body: {},
              response_headers: null,
            },
          },
        })
      );
    }

    if (url.includes("/traffic-logs")) {
      return Promise.resolve(
        jsonResponse({
          data: { hasMore: false, items: [trafficLog], nextCursor: null },
        })
      );
    }

    return Promise.resolve(jsonResponse({ data: {} }));
  };

  globalThis.fetch = Object.assign(mockFetch, {
    preconnect: originalFetch.preconnect,
  });
}

function renderViewer(endpointId: string) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <EndpointTrafficLogViewer
            endpointId={endpointId}
            hasActiveResponse
            responseCount={1}
          />
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

describe("EndpointTrafficLogViewer", () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("auth_token", createAdminToken());
    installApiMock();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  test("clears the selected traffic-log detail when the endpoint changes", async () => {
    const { rerender } = renderViewer("endpoint-1");

    const logLine = await screen.findByRole("button", {
      name: TRAFFIC_LOG_LINE_PATTERN,
    });
    await logLine.click();
    expect(await screen.findByRole("dialog")).toBeDefined();

    rerender(
      <BrowserRouter>
        <QueryClientProvider
          client={
            new QueryClient({
              defaultOptions: { queries: { retry: false } },
            })
          }
        >
          <AuthProvider>
            <EndpointTrafficLogViewer
              endpointId="endpoint-2"
              hasActiveResponse
              responseCount={1}
            />
          </AuthProvider>
        </QueryClientProvider>
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).toBeNull();
    });
  });
});
