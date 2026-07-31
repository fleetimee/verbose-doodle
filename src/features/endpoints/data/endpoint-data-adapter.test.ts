import { describe, expect, test } from "bun:test";
import type { EndpointDataTransport } from "@/features/endpoints/data/endpoint-data-adapter";
import { createHttpEndpointAdapter } from "@/features/endpoints/data/http-endpoint-adapter";
import { createInMemoryEndpointAdapter } from "@/features/endpoints/data/in-memory-endpoint-adapter";
import type { Endpoint } from "@/features/endpoints/types";

function createTransport(
  responses: Record<string, unknown>
): EndpointDataTransport {
  return {
    delete: async <T>(path: string) => responses[path] as T,
    get: async <T>(path: string) => responses[path] as T,
    patch: async <T>(path: string, _body: unknown) => responses[path] as T,
    post: async <T>(path: string, _body: unknown) => responses[path] as T,
    put: async <T>(path: string, _body: unknown) => responses[path] as T,
  };
}

const endpointResponse = {
  biller_name: "PDAM",
  biller_slug: "pdam",
  endpoint_id: 7,
  method: "POST",
  responses: [
    {
      activated: "1",
      delay_ms: "250",
      json: '{"ok":true}',
      name: "Created",
      response_id: 8,
      simulate_timeout: false,
      status_code: "201",
    },
  ],
  slug: "pdam-post-payment-inquiry-a1b2c3",
  url: "/payment/inquiry",
};

describe("Endpoint HTTP data adapter", () => {
  test("maps Endpoint and Response DTOs from the req_res envelope", async () => {
    const adapter = createHttpEndpointAdapter(
      createTransport({
        "/api/endpoint": {
          endpoints: [endpointResponse],
          response_code: "00",
          response_desc: "success",
        },
      })
    );

    await expect(adapter.listEndpoints()).resolves.toEqual([
      {
        billerName: "PDAM",
        billerSlug: "pdam",
        id: "7",
        method: "POST",
        responses: [
          {
            activated: true,
            delayMs: 250,
            id: "8",
            json: '{"ok":true}',
            name: "Created",
            simulateTimeout: false,
            statusCode: 201,
          },
        ],
        slug: "pdam-post-payment-inquiry-a1b2c3",
        url: "/payment/inquiry",
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

  test("uses the slug for endpoint management while retaining numeric child IDs", async () => {
    const slug = "pdam-post-payment-inquiry-a1b2c3";
    const requests: string[] = [];
    const adapter = createHttpEndpointAdapter({
      ...createTransport({}),
      delete: <T>(path: string) => {
        requests.push(`DELETE ${path}`);
        return {} as T;
      },
      get: <T>(path: string) => {
        requests.push(`GET ${path}`);
        return { data: { endpoint: endpointResponse } } as T;
      },
      patch: <T>(path: string) => {
        requests.push(`PATCH ${path}`);
        return { data: { endpoint: endpointResponse } } as T;
      },
    });

    await adapter.getEndpoint(slug);
    await adapter.updateEndpoint({
      changes: { url: "/payment/updated" },
      endpointSlug: slug,
    });
    await adapter.deleteEndpoint(slug);

    expect(requests).toEqual([
      `GET /api/endpoint/${slug}`,
      `PATCH /api/endpoint/${slug}`,
      `DELETE /api/endpoint/${slug}`,
    ]);
  });

  test("normalizes traffic-log variants and metric defaults", async () => {
    const adapter = createHttpEndpointAdapter(
      createTransport({
        "/api/endpoint/7/metrics": { data: {} },
        "/api/endpoint/7/traffic-logs?limit=25": {
          data: {
            has_more: true,
            logs: [
              {
                endpoint_id: 7,
                hit_status: "matched_success",
                id: 10,
                matched: true,
                method: "POST",
                occurred_at: "2026-07-23T10:00:00Z",
                path: "/payment/inquiry",
                request_id: "req-10",
              },
            ],
            next_cursor: "next",
          },
        },
      })
    );

    await expect(
      adapter.listTrafficLogs({
        endpointId: "7",
        filters: { includeBody: false, limit: 25, search: "", status: "all" },
      })
    ).resolves.toMatchObject({
      hasMore: true,
      items: [{ endpointId: "7", id: "10", requestId: "req-10" }],
      nextCursor: "next",
    });
    await expect(adapter.getMetricsSummary("7")).resolves.toEqual({
      averageDurationMs: 0,
      hitStatusCounts: {},
      httpStatusCounts: {},
      maxDurationMs: null,
      minDurationMs: null,
      requestCount: 0,
      totalDurationMs: 0,
    });
  });

  test("uses req_res request shapes for endpoint and response mutations", async () => {
    const requests: Array<{ path: string; body: unknown }> = [];
    const endpoint: Endpoint = {
      billerSlug: "pdam",
      id: "7",
      method: "POST",
      responses: [],
      slug: "pdam-post-payment-inquiry-a1b2c3",
      url: "/payment/inquiry",
    };
    const adapter = createHttpEndpointAdapter({
      ...createTransport({
        "/api/endpoint": { endpoint },
        "/api/endpoint/pdam-post-payment-inquiry-a1b2c3": { endpoint },
        "/api/response": { response: { id: 8, name: "Created" } },
        "/api/response/8": { response: { id: 8, name: "Updated" } },
      }),
      patch: <T>(path: string, body: unknown) => {
        requests.push({ body, path });
        return Promise.resolve({ response: { id: 8, name: "Updated" } } as T);
      },
      post: <T>(path: string, body: unknown) => {
        requests.push({ body, path });
        return Promise.resolve({ endpoint } as T);
      },
    });

    await adapter.createEndpoint({
      billerSlug: "pdam",
      method: "POST",
      url: "/payment/inquiry",
    });
    await adapter.createResponse({
      endpointId: "7",
      json: "{}",
      name: "Created",
      statusCode: 201,
    });
    await adapter.updateResponse({
      changes: { statusCode: 202 },
      endpointId: "7",
      responseId: "8",
    });

    expect(requests).toEqual([
      {
        body: {
          biller_slug: "pdam",
          method: "POST",
          url: "/payment/inquiry",
        },
        path: "/api/endpoint",
      },
      {
        body: {
          activated: "0",
          delayMs: 0,
          endpointId: 7,
          json: "{}",
          name: "Created",
          simulateTimeout: false,
          statusCode: "201",
        },
        path: "/api/response",
      },
      { body: { statusCode: "202" }, path: "/api/response/8" },
    ]);
  });
});

describe("Endpoint in-memory data adapter", () => {
  test("returns a stable slug for newly created endpoints", async () => {
    const adapter = createInMemoryEndpointAdapter();

    await expect(
      adapter.createEndpoint({
        billerSlug: "pdam",
        method: "POST",
        url: "/payment/inquiry",
      })
    ).resolves.toMatchObject({
      id: "1",
      slug: "pdam-post-payment-inquiry-test1",
    });
  });

  test("supports endpoint and response mutations without HTTP", async () => {
    const adapter = createInMemoryEndpointAdapter({
      endpoints: [
        {
          billerSlug: "pdam",
          id: "7",
          method: "POST",
          responses: [],
          slug: "pdam-post-payment-inquiry-a1b2c3",
          url: "/payment/inquiry",
        },
      ],
    });

    const response = await adapter.createResponse({
      endpointId: "7",
      json: "{}",
      name: "Success",
      statusCode: 200,
    });
    await adapter.updateResponse({
      changes: { simulateTimeout: true },
      endpointId: "7",
      responseId: response.id,
    });
    await adapter.activateResponse({
      endpointId: "7",
      responseId: response.id,
    });

    await expect(adapter.getEndpoint("7")).resolves.toBeNull();
    await expect(
      adapter.getEndpoint("pdam-post-payment-inquiry-a1b2c3")
    ).resolves.toMatchObject({
      responses: [{ activated: true, id: response.id, simulateTimeout: true }],
    });
  });
});
