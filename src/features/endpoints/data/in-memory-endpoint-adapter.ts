import type {
  CreateEndpointInput,
  CreateResponseInput,
  EndpointDataAdapter,
  EndpointDataSeed,
  EndpointHourlyMetricsInput,
  EndpointTelemetryInput,
  ResponseActivationInput,
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
  requestCount: 0,
  hitStatusCounts: {},
  httpStatusCounts: {},
  totalDurationMs: 0,
  minDurationMs: null,
  maxDurationMs: null,
  averageDurationMs: 0,
});

function createResponseId(endpoints: readonly Endpoint[]): string {
  const ids = endpoints.flatMap((endpoint) =>
    endpoint.responses.map((response) => Number(response.id))
  );
  const nextId = Math.max(0, ...ids.filter((id) => Number.isFinite(id))) + 1;
  return String(nextId);
}

function findEndpoint(
  endpoints: readonly Endpoint[],
  endpointId: string
): Endpoint {
  const endpoint = endpoints.find((item) => item.id === endpointId);
  if (!endpoint) {
    throw new Error(`Endpoint ${endpointId} was not found`);
  }
  return endpoint;
}

function findResponse(
  endpoints: readonly Endpoint[],
  input: ResponseActivationInput
): EndpointResponse {
  const endpoint = findEndpoint(endpoints, input.endpointId);
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
    async listEndpoints() {
      await Promise.resolve();
      return endpoints.map(cloneEndpoint);
    },
    async getEndpoint(endpointId) {
      await Promise.resolve();
      const endpoint = endpoints.find((item) => item.id === endpointId);
      return endpoint ? cloneEndpoint(endpoint) : null;
    },
    async createEndpoint(input: CreateEndpointInput) {
      await Promise.resolve();
      const endpoint: Endpoint = {
        id: String(endpoints.length + 1),
        method: input.method,
        url: input.url,
        billerId: input.billerId,
        responses: [],
      };
      endpoints.push(endpoint);
      return cloneEndpoint(endpoint);
    },
    async updateEndpoint(input: UpdateEndpointInput) {
      await Promise.resolve();
      const endpoint = findEndpoint(endpoints, input.endpointId);
      Object.assign(endpoint, input.changes);
      return cloneEndpoint(endpoint);
    },
    async deleteEndpoint(endpointId) {
      await Promise.resolve();
      const index = endpoints.findIndex((item) => item.id === endpointId);
      if (index < 0) {
        return;
      }
      endpoints.splice(index, 1);
      trafficLogs.delete(endpointId);
    },
    async createResponse(input: CreateResponseInput) {
      await Promise.resolve();
      const endpoint = findEndpoint(endpoints, input.endpointId);
      const response: EndpointResponse = {
        id: createResponseId(endpoints),
        name: input.name,
        json: input.json,
        statusCode: input.statusCode,
        activated: endpoint.responses.length === 0,
        delayMs: input.delayMs ?? 0,
        simulateTimeout: input.simulateTimeout ?? false,
      };
      endpoint.responses.push(response);
      return cloneResponse(response);
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
    async deleteResponse(input) {
      await Promise.resolve();
      const endpoint = findEndpoint(endpoints, input.endpointId);
      endpoint.responses = endpoint.responses.filter(
        (response) => response.id !== input.responseId
      );
    },
    async activateResponse(input) {
      await Promise.resolve();
      const endpoint = findEndpoint(endpoints, input.endpointId);
      for (const response of endpoint.responses) {
        response.activated = response.id === input.responseId;
      }
      return cloneResponse(findResponse(endpoints, input));
    },
    async deactivateResponse(input) {
      await Promise.resolve();
      const response = findResponse(endpoints, input);
      response.activated = false;
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
        items,
        nextCursor: null,
        hasMore: items.length < logs.length,
      } satisfies EndpointTrafficLogsResult;
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
        requestHeaders: null,
        requestBody: null,
        responseHeaders: null,
        responseBody: null,
        errorMessage: null,
      } satisfies EndpointTrafficLogDetail;
    },
    async clearTrafficLogs(endpointId) {
      await Promise.resolve();
      trafficLogs.set(endpointId, []);
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
        requestCount: logs.length,
        hitStatusCounts,
        httpStatusCounts,
        totalDurationMs,
        minDurationMs: durations.length ? Math.min(...durations) : null,
        maxDurationMs: durations.length ? Math.max(...durations) : null,
        averageDurationMs: durations.length
          ? totalDurationMs / durations.length
          : 0,
      };
    },
    async getHourlyMetrics(input: EndpointHourlyMetricsInput) {
      const summary = await this.getMetricsSummary(input.endpointId);
      const bucket: EndpointHourlyMetric = {
        ...summary,
        bucketStart: input.from,
      };
      return [bucket];
    },
  };
}
