import type {
  LogBrowseRequest,
  LogBrowseResult,
  LogCatalog,
  LogPage,
  LogSource,
  LogSourceRequest,
} from "@/features/log-viewer/types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const root = API_ENDPOINTS.admin.logSources;
const detail = (id: string) => `${root}/${encodeURIComponent(id)}`;

export async function fetchLogSources(
  signal?: AbortSignal
): Promise<LogSource[]> {
  const result = await apiGet<{ data: LogSource[] }>(root, {
    signal,
    cache: "no-store",
  });
  return result.data;
}

export async function saveLogSource(
  request: LogSourceRequest,
  id?: string
): Promise<LogSource> {
  const result = id
    ? await apiPut<{ data: LogSource }>(detail(id), request)
    : await apiPost<{ data: LogSource }>(root, request);
  return result.data;
}

export async function deleteLogSource(id: string) {
  await apiDelete(detail(id));
}

export async function fetchLogCatalog(
  id: string,
  from: string,
  to: string,
  signal?: AbortSignal
): Promise<LogCatalog> {
  const params = new URLSearchParams({ from });
  if (to) {
    params.set("to", to);
  }
  const result = await apiGet<{ data: LogCatalog }>(
    `${detail(id)}/files?${params}`,
    { signal, cache: "no-store" }
  );
  return result.data;
}

export async function fetchLogPage(options: {
  id: string;
  from: string;
  to: string;
  stream: string;
  direction: "latest" | "older" | "forward";
  cursor?: string | null;
  signal: AbortSignal;
}): Promise<LogPage> {
  const { id, signal, cursor, ...query } = options;
  const params = new URLSearchParams(query);
  if (!query.to) {
    params.delete("to");
  }
  if (cursor) {
    params.set("cursor", cursor);
  }
  const result = await apiGet<{ data: LogPage }>(
    `${detail(id)}/content?${params}`,
    { signal, cache: "no-store" }
  );
  return result.data;
}

export async function browseLogFolder(
  request: LogBrowseRequest,
  signal: AbortSignal
): Promise<LogBrowseResult> {
  const result = await apiPost<{ data: LogBrowseResult }>(
    `${root}/browse`,
    request,
    { signal, cache: "no-store", timeout: 60_000 }
  );
  return result.data;
}

export async function discoverLogShares(
  request: Omit<LogBrowseRequest, "shareName" | "path">,
  signal: AbortSignal
): Promise<{ shares: string[]; limited: boolean }> {
  const result = await apiPost<{
    data: { shares: string[]; limited: boolean };
  }>(`${root}/shares`, request, { signal, cache: "no-store", timeout: 60_000 });
  return result.data;
}
