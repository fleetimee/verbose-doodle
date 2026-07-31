const endpointDataQueryKeys = {
  catalog: ["endpoint-data", "catalog"] as const,
  workspacePrefix: ["endpoint-data", "workspace"] as const,
  workspace: (endpointId: string) =>
    ["endpoint-data", "workspace", endpointId] as const,
  telemetry: (endpointId: string, filters: unknown) =>
    ["endpoint-data", "telemetry", endpointId, filters] as const,
  telemetryDetail: (endpointId: string, logId: string) =>
    ["endpoint-data", "telemetry", endpointId, "detail", logId] as const,
  metrics: (endpointId: string) =>
    ["endpoint-data", "telemetry", endpointId, "metrics"] as const,
  hourlyMetrics: (endpointId: string, from: string, to: string) =>
    ["endpoint-data", "telemetry", endpointId, "metrics", from, to] as const,
} as const;

export function endpointDataTelemetryPrefix(endpointId: string) {
  return ["endpoint-data", "telemetry", endpointId] as const;
}

export { endpointDataQueryKeys };
