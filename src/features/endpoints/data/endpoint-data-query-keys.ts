const endpointDataQueryKeys = {
  catalog: ["endpoint-data", "catalog"] as const,
  hourlyMetrics: (endpointId: string, from: string, to: string) =>
    ["endpoint-data", "telemetry", endpointId, "metrics", from, to] as const,
  metrics: (endpointId: string) =>
    ["endpoint-data", "telemetry", endpointId, "metrics"] as const,
  telemetry: (endpointId: string, filters: unknown) =>
    ["endpoint-data", "telemetry", endpointId, filters] as const,
  telemetryDetail: (endpointId: string, logId: string) =>
    ["endpoint-data", "telemetry", endpointId, "detail", logId] as const,
  workspace: (endpointSlug: string) =>
    ["endpoint-data", "workspace", endpointSlug] as const,
  workspacePrefix: ["endpoint-data", "workspace"] as const,
} as const;

export function endpointDataTelemetryPrefix(endpointId: string) {
  return ["endpoint-data", "telemetry", endpointId] as const;
}

export { endpointDataQueryKeys };
