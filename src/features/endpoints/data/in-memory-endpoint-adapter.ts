import type {
  CreateEndpointInput,
  CreateResponseInput,
  EndpointDataAdapter,
  EndpointDataSeed,
  EndpointHourlyMetricsInput,
  EndpointTelemetryInput,
  ResponseActivationInput,
  ResponseCloneInput,
  ResponseSimulationInput,
  UpdateEndpointInput,
  UpdateResponseInput,
} from "@/features/endpoints/data/endpoint-data-adapter";
import type {
  Endpoint,
  EndpointHourlyMetric,
  EndpointMetric,
  EndpointResponse,
  EndpointTrafficLog,
  EndpointTrafficLogDetail,
  EndpointTrafficLogsResult,
} from "@/features/endpoints/types";

const cloneResponse = (response: EndpointResponse): EndpointResponse => ({
  ...response,
});

const cloneEndpoint = (endpoint: Endpoint): Endpoint => ({
  ...endpoint,
  responses: endpoint.responses.map(cloneResponse),
});

const cloneLog = (log: EndpointTrafficLog): EndpointTrafficLog => ({
  ...log,
});

const emptyMetric = (): EndpointMetric => ({
  averageDurationMs: 0,
  hitStatusCounts: {},
  httpStatusCounts: {},
  maxDurationMs: null,
  minDurationMs: null,
  requestCount: 0,
  totalDurationMs: 0,
});

const MAX_RESPONSE_NAME_LENGTH = 64;
const COPY_SUFFIX = /^(.*) \(Copy(?: (\d+))?\)$/;

function createResponseId(endpoints: readonly Endpoint[]): string {
  const ids = endpoints.flatMap((endpoint) =>
    endpoint.responses.map((response) => Number(response.id))
  );
  const nextId = Math.max(0, ...ids.filter((id) => Number.isFinite(id))) + 1;
  return String(nextId);
}

function createResponseCloneName(
  sourceName: string,
  responses: readonly EndpointResponse[]
): string {
  const match = COPY_SUFFIX.exec(sourceName);
  const baseName = match?.[1] ?? sourceName;
  let suffixNumber = match?.[2] ? Number(match[2]) + 1 : 1;
  const existingNames = new Set(responses.map((response) => response.name));

  while (true) {
    const suffix = suffixNumber === 1 ? " (Copy)" : ` (Copy ${suffixNumber})`;
    const baseLength = Math.max(0, MAX_RESPONSE_NAME_LENGTH - suffix.length);
    const candidate = `${baseName.slice(0, baseLength)}${suffix}`;
    if (!existingNames.has(candidate)) {
      return candidate;
    }
    suffixNumber += 1;
  }
}

function createEndpointSlug(input: CreateEndpointInput, id: string): string {
  const path =
    input.url
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "root";
  return `${input.billerSlug}-${input.method.toLowerCase()}-${path}-test${id}`;
}

function findEndpointById(
  endpoints: readonly Endpoint[],
  endpointId: string
): Endpoint {
  const endpoint = endpoints.find((item) => item.id === endpointId);
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointId} was not found`);
  }
  return endpoint;
}

function findEndpointBySlug(
  endpoints: readonly Endpoint[],
  endpointSlug: string
): Endpoint {
  const endpoint = endpoints.find((item) => item.slug === endpointSlug);
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointSlug} was not found`);
  }
  return endpoint;
}

function findResponse(
  endpoints: readonly Endpoint[],
  input: ResponseActivationInput
): EndpointResponse {
  const endpoint = findEndpointById(endpoints, input.endpointId);
  const response = endpoint.responses.find(
    (item) => item.id === input.responseId
  );
  if (!response) {
    throw new Error(`Response ${input.responseId} was not found`);
  }
  return response;
}

function updateResponseFields(
  response: EndpointResponse,
  changes: UpdateResponseInput["changes"]
): EndpointResponse {
  return {
    ...response,
    ...changes,
  };
}

export function createInMemoryEndpointAdapter(
  seed: EndpointDataSeed = {}
): EndpointDataAdapter {
  const endpoints = (seed.endpoints ?? []).map(cloneEndpoint);
  const trafficLogs = new Map<string, EndpointTrafficLog[]>(
    Object.entries(seed.trafficLogs ?? {}).map(([endpointId, logs]) => [
      endpointId,
      logs.map(cloneLog),
    ])
  );

  return {
    async activateResponse(input) {
      await Promise.resolve();
      const endpoint = findEndpointById(endpoints, input.endpointId);
      for (const response of endpoint.responses) {
        response.activated = response.id === input.responseId;
      }
      return cloneResponse(findResponse(endpoints, input));
    },
    async clearTrafficLogs(endpointId) {
      await Promise.resolve();
      trafficLogs.set(endpointId, []);
    },
    async createEndpoint(input: CreateEndpointInput) {
      await Promise.resolve();
      const endpoint: Endpoint = {
        billerSlug: input.billerSlug,
        id: String(endpoints.length + 1),
        method: input.method,
        responses: [],
        slug: createEndpointSlug(input, String(endpoints.length + 1)),
        url: input.url,
      };
      endpoints.push(endpoint);
      return cloneEndpoint(endpoint);
    },
    async createResponse(input: CreateResponseInput) {
      await Promise.resolve();
      const endpoint = findEndpointById(endpoints, input.endpointId);
      const response: EndpointResponse = {
        activated: endpoint.responses.length === 0,
        delayMs: input.delayMs ?? 0,
        id: createResponseId(endpoints),
        json: input.json,
        name: input.name,
        simulateTimeout: input.simulateTimeout ?? false,
        statusCode: input.statusCode,
      };
      endpoint.responses.push(response);
      return cloneResponse(response);
    },
    async cloneResponse(input: ResponseCloneInput) {
      await Promise.resolve();
      const endpoint = findEndpointById(endpoints, input.endpointId);
      const source = findResponse(endpoints, input);
      const response: EndpointResponse = {
        ...source,
        activated: false,
        id: createResponseId(endpoints),
        name: createResponseCloneName(source.name, endpoint.responses),
      };
      endpoint.responses.push(response);
      return cloneResponse(response);
    },
    async deactivateResponse(input) {
      await Promise.resolve();
      const response = findResponse(endpoints, input);
      response.activated = false;
      return cloneResponse(response);
    },
    async deleteEndpoint(endpointSlug) {
      await Promise.resolve();
      const index = endpoints.findIndex((item) => item.slug === endpointSlug);
      if (index < 0) {
        return;
      }
      const endpointId = endpoints[index].id;
      endpoints.splice(index, 1);
      trafficLogs.delete(endpointId);
    },
    async deleteResponse(input) {
      await Promise.resolve();
      const endpoint = findEndpointById(endpoints, input.endpointId);
      endpoint.responses = endpoint.responses.filter(
        (response) => response.id !== input.responseId
      );
    },
    async getEndpoint(endpointSlug) {
      await Promise.resolve();
      const endpoint = endpoints.find((item) => item.slug === endpointSlug);
      return endpoint ? cloneEndpoint(endpoint) : null;
    },
    async getHourlyMetrics(input: EndpointHourlyMetricsInput) {
      const summary = await this.getMetricsSummary(input.endpointId);
      const bucket: EndpointHourlyMetric = {
        ...summary,
        bucketStart: input.from,
      };
      return [bucket];
    },
    async getMetricsSummary(endpointId) {
      await Promise.resolve();
      const logs = trafficLogs.get(endpointId) ?? [];
      if (logs.length === 0) {
        return emptyMetric();
      }
      const durations = logs
        .map((log) => log.durationMs)
        .filter((duration): duration is number => duration !== null);
      const totalDurationMs = durations.reduce(
        (total, duration) => total + duration,
        0
      );
      const hitStatusCounts: Record<string, number> = {};
      const httpStatusCounts: Record<string, number> = {};
      for (const log of logs) {
        hitStatusCounts[log.hitStatus] =
          (hitStatusCounts[log.hitStatus] ?? 0) + 1;
        if (log.httpStatusCode !== null) {
          const status = String(log.httpStatusCode);
          httpStatusCounts[status] = (httpStatusCounts[status] ?? 0) + 1;
        }
      }
      return {
        averageDurationMs: durations.length
          ? totalDurationMs / durations.length
          : 0,
        hitStatusCounts,
        httpStatusCounts,
        maxDurationMs: durations.length ? Math.max(...durations) : null,
        minDurationMs: durations.length ? Math.min(...durations) : null,
        requestCount: logs.length,
        totalDurationMs,
      };
    },
    async getTrafficLogDetail(endpointId, logId) {
      await Promise.resolve();
      const log = trafficLogs
        .get(endpointId)
        ?.find((item) => item.id === logId);
      if (!log) {
        throw new Error(`Traffic log ${logId} was not found`);
      }
      return {
        ...cloneLog(log),
        errorMessage: null,
        requestBody: null,
        requestHeaders: null,
        responseBody: null,
        responseHeaders: null,
      } satisfies EndpointTrafficLogDetail;
    },
    async listEndpoints() {
      await Promise.resolve();
      return endpoints.map(cloneEndpoint);
    },
    async listTrafficLogs(input: EndpointTelemetryInput) {
      await Promise.resolve();
      const logs = (trafficLogs.get(input.endpointId) ?? []).filter((log) => {
        const matchesStatus =
          input.filters.status === "all" ||
          log.hitStatus === input.filters.status;
        const search = input.filters.search.trim().toLowerCase();
        const matchesSearch =
          !search ||
          log.path.toLowerCase().includes(search) ||
          log.method.toLowerCase().includes(search) ||
          log.requestId.toLowerCase().includes(search);
        return matchesStatus && matchesSearch;
      });
      const items = logs.slice(0, input.filters.limit).map(cloneLog);
      return {
        hasMore: items.length < logs.length,
        items,
        nextCursor: null,
      } satisfies EndpointTrafficLogsResult;
    },
    async updateEndpoint(input: UpdateEndpointInput) {
      await Promise.resolve();
      const endpoint = findEndpointBySlug(endpoints, input.endpointSlug);
      Object.assign(endpoint, input.changes);
      return cloneEndpoint(endpoint);
    },
    async updateResponse(input: UpdateResponseInput) {
      await Promise.resolve();
      const response = findResponse(endpoints, {
        endpointId: input.endpointId,
        responseId: input.responseId,
      });
      Object.assign(response, updateResponseFields(response, input.changes));
      return cloneResponse(response);
    },
    async updateResponseSimulation(input: ResponseSimulationInput) {
      await Promise.resolve();
      const response = findResponse(endpoints, input);
      if (input.delayMs !== undefined) {
        response.delayMs = input.delayMs;
      }
      if (input.simulateTimeout !== undefined) {
        response.simulateTimeout = input.simulateTimeout;
      }
      return cloneResponse(response);
    },
  };
}
