import { describe, expect, test } from "bun:test";
import type { EndpointDataTransport } from "@/features/endpoints/data/endpoint-data-adapter";
import { createHttpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import { createInMemoryEndpointAdapter } from "@/features/endpoints/data/in-memory-endpoint-adapter";
import type { Endpoint } from "@/features/endpoints/types";

function createTransport(
  responses: Record<string, unknown>
): EndpointDataTransport {
  return {
    get: async <T>(path: string) => responses[path] as T,
    post: async <T>(path: string, _body: unknown) => responses[path] as T,
    put: async <T>(path: string, _body: unknown) => responses[path] as T,
    patch: async <T>(path: string, _body: unknown) => responses[path] as T,
    delete: async <T>(path: string) => responses[path] as T,
  };
}

const endpointResponse = {
  endpoint_id: 7,
  method: "POST",
  url: "/payment/inquiry",
  biller_id: 2,
  biller_name: "PDAM",
  responses: [
    {
      response_id: 8,
      json: '{"ok":true}',
      status_code: "201",
      activated: "1",
      name: "Created",
      delay_ms: "250",
      simulate_timeout: false,
    },
  ],
};

describe("Endpoint HTTP data adapter", () => {
  test("maps Endpoint and Response DTOs from the req_res envelope", async () => {
    const adapter = createHttpEndpointAdapter(
      createTransport({
        "/api/endpoint": {
          response_code: "00",
          response_desc: "success",
          endpoints: [endpointResponse],
        },
      })
    );

    await expect(adapter.listEndpoints()).resolves.toEqual([
      {
        id: "7",
        method: "POST",
        url: "/payment/inquiry",
        billerId: 2,
        billerName: "PDAM",
        responses: [
          {
            id: "8",
            name: "Created",
            json: '{"ok":true}',
            statusCode: 201,
            activated: true,
            delayMs: 250,
            simulateTimeout: false,
          },
        ],
      },
    ]);
  });

  test("turns an HTTP 404 into a missing endpoint", async () => {
    const notFound = Object.assign(new Error("Not found"), { status: 404 });
    const adapter = createHttpEndpointAdapter({
      ...createTransport({}),
      get: () => Promise.reject(notFound),
    });

    await expect(adapter.getEndpoint("missing")).resolves.toBeNull();
  });

  test("normalizes traffic-log variants and metric defaults", async () => {
    const adapter = createHttpEndpointAdapter(
      createTransport({
        "/api/endpoint/7/traffic-logs?limit=25": {
          data: {
            logs: [
              {
                id: 10,
                request_id: "req-10",
                occurred_at: "2026-07-23T10:00:00Z",
                endpoint_id: 7,
                hit_status: "matched_success",
                matched: true,
                method: "POST",
                path: "/payment/inquiry",
              },
            ],
            next_cursor: "next",
            has_more: true,
          },
        },
        "/api/endpoint/7/metrics": { data: {} },
      })
    );

    await expect(
      adapter.listTrafficLogs({
        endpointId: "7",
        filters: { limit: 25, status: "all", search: "", includeBody: false },
      })
    ).resolves.toMatchObject({
      nextCursor: "next",
      hasMore: true,
      items: [{ id: "10", requestId: "req-10", endpointId: "7" }],
    });
    await expect(adapter.getMetricsSummary("7")).resolves.toEqual({
      requestCount: 0,
      hitStatusCounts: {},
      httpStatusCounts: {},
      totalDurationMs: 0,
      minDurationMs: null,
      maxDurationMs: null,
      averageDurationMs: 0,
    });
  });

  test("uses req_res request shapes for endpoint and response mutations", async () => {
    const requests: Array<{ path: string; body: unknown }> = [];
    const endpoint: Endpoint = {
      id: "7",
      method: "POST",
      url: "/payment/inquiry",
      billerId: 2,
      responses: [],
    };
    const adapter = createHttpEndpointAdapter({
      ...createTransport({
        "/api/endpoint": { endpoint },
        "/api/endpoint/7": { endpoint },
        "/api/response": { response: { id: 8, name: "Created" } },
        "/api/response/8": { response: { id: 8, name: "Updated" } },
      }),
      post: <T>(path: string, body: unknown) => {
        requests.push({ path, body });
        return Promise.resolve({ endpoint } as T);
      },
      patch: <T>(path: string, body: unknown) => {
        requests.push({ path, body });
        return Promise.resolve({ response: { id: 8, name: "Updated" } } as T);
      },
    });

    await adapter.createEndpoint({
      method: "POST",
      url: "/payment/inquiry",
      billerId: 2,
    });
    await adapter.createResponse({
      endpointId: "7",
      name: "Created",
      json: "{}",
      statusCode: 201,
    });
    await adapter.updateResponse({
      endpointId: "7",
      responseId: "8",
      changes: { statusCode: 202 },
    });

    expect(requests).toEqual([
      {
        path: "/api/endpoint",
        body: { method: "POST", url: "/payment/inquiry", billerId: 2 },
      },
      {
        path: "/api/response",
        body: {
          endpointId: 7,
          json: "{}",
          statusCode: "201",
          activated: "0",
          name: "Created",
          delayMs: 0,
          simulateTimeout: false,
        },
      },
      { path: "/api/response/8", body: { statusCode: "202" } },
    ]);
  });
});

describe("Endpoint in-memory data adapter", () => {
  test("supports endpoint and response mutations without HTTP", async () => {
    const adapter = createInMemoryEndpointAdapter({
      endpoints: [
        {
          id: "7",
          method: "POST",
          url: "/payment/inquiry",
          billerId: 2,
          responses: [],
        },
      ],
    });

    const response = await adapter.createResponse({
      endpointId: "7",
      name: "Success",
      json: "{}",
      statusCode: 200,
    });
    await adapter.updateResponse({
      endpointId: "7",
      responseId: response.id,
      changes: { simulateTimeout: true },
    });
    await adapter.activateResponse({
      endpointId: "7",
      responseId: response.id,
    });

    await expect(adapter.getEndpoint("7")).resolves.toMatchObject({
      responses: [{ id: response.id, activated: true, simulateTimeout: true }],
    });
  });
});
