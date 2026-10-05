import type { SheetData } from "write-excel-file/browser";
import type { EndpointTrafficLog } from "@/features/endpoints/types";

const COLUMNS = [
  { key: "occurredAt", label: "Timestamp (UTC)", width: 28 },
  { key: "requestId", label: "Request ID", width: 38 },
  { key: "hitStatus", label: "Status", width: 24 },
  { key: "method", label: "Method", width: 10 },
  { key: "path", label: "Path", width: 40 },
  { key: "queryString", label: "Query string", width: 35 },
  { key: "httpStatusCode", label: "HTTP status", width: 14 },
  { key: "durationMs", label: "Duration (ms)", width: 16 },
  { key: "sourceIp", label: "Source IP", width: 20 },
  { key: "sourcePort", label: "Source port", width: 14 },
  { key: "destinationIp", label: "Destination IP", width: 20 },
  { key: "destinationPort", label: "Destination port", width: 18 },
  { key: "responseName", label: "Response name", width: 25 },
  { key: "delayMs", label: "Delay (ms)", width: 14 },
  { key: "matched", label: "Matched", width: 12 },
  { key: "simulateTimeout", label: "Simulate timeout", width: 18 },
  { key: "forwardedFor", label: "Forwarded for", width: 30 },
  { key: "userAgent", label: "User agent", width: 45 },
  { key: "requestBodyPreview", label: "Request body preview", width: 60 },
  { key: "responseBodyPreview", label: "Response body preview", width: 60 },
  { key: "id", label: "Log ID", width: 38 },
  { key: "endpointId", label: "Endpoint ID", width: 25 },
  { key: "responseId", label: "Response ID", width: 25 },
  { key: "billerId", label: "Biller ID", width: 25 },
] as const;

export function getTrafficLogSpreadsheet(logs: readonly EndpointTrafficLog[]) {
  const data: SheetData = [
    COLUMNS.map(({ label }) => ({
      value: label,
      type: String,
      fontWeight: "bold",
      backgroundColor: "#226b65",
      textColor: "#ffffff",
      wrap: true,
    })),
    ...logs.map((log) =>
      COLUMNS.map(({ key }) => {
        const value = log[key];
        if (value === null) {
          return null;
        }
        if (typeof value === "number") {
          return { value, type: Number };
        }
        if (typeof value === "boolean") {
          return { value, type: Boolean };
        }
        return { value, type: String, wrap: true };
      })
    ),
  ];
  return {
    data,
    columns: COLUMNS.map(({ width }) => ({ width })),
  };
}

export async function downloadTrafficLogSpreadsheet(
  logs: readonly EndpointTrafficLog[],
  endpointId: string
) {
  const { default: writeXlsxFile } = await import("write-excel-file/browser");
  const { data, columns } = getTrafficLogSpreadsheet(logs);
  await writeXlsxFile(data, {
    sheet: "Traffic logs",
    columns,
    stickyRowsCount: 1,
  }).toFile(`endpoint-${endpointId}-traffic-logs.xlsx`);
}
