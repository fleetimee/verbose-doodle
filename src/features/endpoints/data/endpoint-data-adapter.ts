import type {
  Endpoint,
  EndpointHourlyMetric,
  EndpointMetric,
  EndpointResponse,
  EndpointTrafficLog,
  EndpointTrafficLogDetail,
  EndpointTrafficLogsFilters,
  EndpointTrafficLogsResult,
  HttpMethod,
} from "@/features/endpoints/types";

export type CreateEndpointInput = {
  readonly method: HttpMethod;
  readonly url: string;
  readonly billerSlug: string;
};

export type UpdateEndpointInput = {
  readonly endpointSlug: string;
  readonly changes: Partial<
    Pick<CreateEndpointInput, "method" | "url" | "billerSlug">
  >;
};

export type CreateResponseInput = {
  readonly endpointId: string;
  readonly name: string;
  readonly json: string;
  readonly statusCode: number;
  readonly delayMs?: number;
  readonly simulateTimeout?: boolean;
};

export type UpdateResponseInput = {
  readonly endpointId: string;
  readonly responseId: string;
  readonly changes: Partial<
    Pick<
      CreateResponseInput,
      "name" | "json" | "statusCode" | "delayMs" | "simulateTimeout"
    >
  >;
};

export type ResponseSimulationInput = {
  readonly endpointId: string;
  readonly responseId: string;
  readonly delayMs?: number;
  readonly simulateTimeout?: boolean;
};

export type ResponseActivationInput = {
  readonly endpointId: string;
  readonly responseId: string;
};

export type EndpointTelemetryInput = {
  readonly endpointId: string;
  readonly filters: EndpointTrafficLogsFilters;
};

export type EndpointHourlyMetricsInput = {
  readonly endpointId: string;
  readonly from: string;
  readonly to: string;
};

export type EndpointDataAdapter = {
  readonly listEndpoints: () => Promise<Endpoint[]>;
  readonly getEndpoint: (endpointSlug: string) => Promise<Endpoint | null>;
  readonly createEndpoint: (input: CreateEndpointInput) => Promise<Endpoint>;
  readonly updateEndpoint: (input: UpdateEndpointInput) => Promise<Endpoint>;
  readonly deleteEndpoint: (endpointSlug: string) => Promise<void>;
  readonly createResponse: (
    input: CreateResponseInput
  ) => Promise<EndpointResponse>;
  readonly updateResponse: (
    input: UpdateResponseInput
  ) => Promise<EndpointResponse>;
  readonly deleteResponse: (input: ResponseActivationInput) => Promise<void>;
  readonly activateResponse: (
    input: ResponseActivationInput
  ) => Promise<EndpointResponse>;
  readonly deactivateResponse: (
    input: ResponseActivationInput
  ) => Promise<EndpointResponse>;
  readonly updateResponseSimulation: (
    input: ResponseSimulationInput
  ) => Promise<EndpointResponse>;
  readonly listTrafficLogs: (
    input: EndpointTelemetryInput
  ) => Promise<EndpointTrafficLogsResult>;
  readonly getTrafficLogDetail: (
    endpointId: string,
    logId: string
  ) => Promise<EndpointTrafficLogDetail>;
  readonly clearTrafficLogs: (endpointId: string) => Promise<void>;
  readonly getMetricsSummary: (endpointId: string) => Promise<EndpointMetric>;
  readonly getHourlyMetrics: (
    input: EndpointHourlyMetricsInput
  ) => Promise<EndpointHourlyMetric[]>;
};

export type EndpointDataTransport = {
  readonly get: <T>(path: string) => Promise<T>;
  readonly post: <T, D>(path: string, body: D) => Promise<T>;
  readonly put: <T, D>(path: string, body: D) => Promise<T>;
  readonly patch: <T, D>(path: string, body: D) => Promise<T>;
  readonly delete: <T>(path: string) => Promise<T>;
};

export type EndpointDataSeed = {
  readonly endpoints?: readonly Endpoint[];
  readonly trafficLogs?: Readonly<
    Record<string, readonly EndpointTrafficLog[]>
  >;
};
