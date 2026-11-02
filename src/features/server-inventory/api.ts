import type {
  ServerCleanupInspection,
  ServerContainerDetail,
  ServerContainerSummary,
  ServerContainers,
  ServerEntry,
  ServerEntryPage,
  ServerEntryRequest,
  ServerImages,
  ServerInventoryQuery,
  ServerMetrics,
  ServerProcesses,
  ServerSpecInfo,
} from "@/features/server-inventory/types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const endpoints = API_ENDPOINTS.admin.servers;
const PRUNE_ERROR_STATUS = /ERROR:\s*([A-Z_]+)/;

export async function runServerContainerAction(
  id: string,
  containerId: string,
  action: "start" | "stop" | "restart"
): Promise<{ status: string; completedAt: string | null }> {
  const response = await apiPost<{
    data: { status: string; completedAt: string | null };
  }>(
    `${endpoints.detail(id)}/containers/${encodeURIComponent(containerId)}/${action}`,
    undefined,
    { cache: "no-store", timeout: 45_000 }
  );
  return response.data;
}

export async function fetchServerContainerSummary(
  id: string,
  signal: AbortSignal
): Promise<ServerContainerSummary> {
  const response = await apiGet<{ data: ServerContainerSummary }>(
    `${endpoints.detail(id)}/containers/summary`,
    { cache: "no-store", signal }
  );
  return response.data;
}

export async function fetchServerContainerDetail(
  id: string,
  containerId: string,
  signal: AbortSignal
): Promise<ServerContainerDetail> {
  const response = await apiGet<{ data: ServerContainerDetail }>(
    `${endpoints.detail(id)}/containers/${encodeURIComponent(containerId)}`,
    { cache: "no-store", signal }
  );
  return response.data;
}

export async function fetchServerContainerStats(
  id: string,
  containerId: string,
  signal: AbortSignal
): Promise<ServerContainers> {
  const response = await apiGet<{ data: ServerContainers }>(
    `${endpoints.detail(id)}/containers/${encodeURIComponent(containerId)}/stats`,
    { cache: "no-store", signal }
  );
  return response.data;
}

export async function fetchServerContainers(
  id: string,
  signal: AbortSignal
): Promise<ServerContainers> {
  const response = await apiGet<{ data: ServerContainers }>(
    `${endpoints.detail(id)}/containers`,
    { cache: "no-store", signal }
  );
  return response.data;
}

export async function fetchServerMetrics(
  id: string,
  signal: AbortSignal
): Promise<ServerMetrics> {
  const response = await apiGet<{ data: ServerMetrics }>(
    `${endpoints.detail(id)}/metrics`,
    { cache: "no-store", signal, timeout: 20_000 }
  );
  return response.data;
}

export async function fetchServerProcesses(
  id: string,
  signal: AbortSignal
): Promise<ServerProcesses> {
  const response = await apiGet<{ data: ServerProcesses }>(
    `${endpoints.detail(id)}/processes`,
    { cache: "no-store", signal, timeout: 20_000 }
  );
  return response.data;
}

export async function fetchServerDirectories(
  id: string,
  path: string,
  signal: AbortSignal,
  fileOffset = 0
): Promise<ServerCleanupInspection> {
  const response = await apiGet<{ data: ServerCleanupInspection }>(
    `${endpoints.detail(id)}/cleanup/directories?${new URLSearchParams({ path, fileOffset: String(fileOffset) })}`,
    { cache: "no-store", signal, timeout: 25_000 }
  );
  return response.data;
}

export async function fetchServerCleanup(
  id: string,
  signal: AbortSignal
): Promise<ServerCleanupInspection> {
  const response = await apiGet<{ data: ServerCleanupInspection }>(
    `${endpoints.detail(id)}/cleanup`,
    { cache: "no-store", signal, timeout: 45_000 }
  );
  return response.data;
}

export async function fetchServerSpec(
  id: string,
  signal: AbortSignal
): Promise<ServerSpecInfo> {
  const response = await apiGet<{ data: ServerSpecInfo }>(
    `${endpoints.detail(id)}/spec`,
    { cache: "no-store", signal }
  );
  return response.data;
}

export async function fetchServerEntries(
  query: ServerInventoryQuery,
  signal?: AbortSignal
): Promise<ServerEntryPage> {
  const params = new URLSearchParams({
    page: String(query.page),
    size: String(query.size),
    search: query.search,
    accessType: query.accessType,
    databaseEngine: query.databaseEngine,
    sortBy: query.sortBy,
    direction: query.direction,
  });
  const response = await apiGet<{ data: ServerEntryPage }>(
    `${endpoints.list}?${params}`,
    { signal }
  );
  return response.data;
}

export async function fetchServerHosts(): Promise<string[]> {
  const response = await apiGet<{ data: { hosts: string[] } }>(
    `${endpoints.list}/hosts`
  );
  return response.data.hosts;
}

export async function fetchAccessTypes(): Promise<string[]> {
  const response = await apiGet<{ data: { accessTypes: string[] } }>(
    endpoints.accessTypes
  );
  return response.data.accessTypes;
}

export async function saveServerEntry({
  id,
  request,
}: {
  id?: string;
  request: ServerEntryRequest;
}): Promise<ServerEntry> {
  const response = id
    ? await apiPut<{ data: { server: ServerEntry } }>(
        endpoints.update(id),
        request
      )
    : await apiPost<{ data: { server: ServerEntry } }>(
        endpoints.create,
        request
      );
  return response.data.server;
}

export async function deleteServerEntry(id: string): Promise<void> {
  await apiDelete(endpoints.delete(id));
}

export async function revealServerPassword(id: string): Promise<string> {
  const response = await apiPost<{ data: { password: string } }>(
    endpoints.revealPassword(id),
    undefined,
    { cache: "no-store" }
  );
  return response.data.password;
}

export async function fetchServerEntry(
  id: string,
  signal?: AbortSignal
): Promise<ServerEntry> {
  const response = await apiGet<{ data: { server: ServerEntry } }>(
    endpoints.detail(id),
    { signal }
  );
  return response.data.server;
}

export interface RdpCertificateReview {
  canTrust: boolean;
  certificate: {
    fingerprint: string;
    subject: string;
    issuer: string;
    validFrom: string;
    validUntil: string;
  };
  previousFingerprint: string | null;
  trusted: boolean;
}

export async function inspectRdpCertificate(
  id: string
): Promise<RdpCertificateReview> {
  const response = await apiGet<{ data: RdpCertificateReview }>(
    `${endpoints.detail(id)}/rdp-certificate`,
    { cache: "no-store" }
  );
  return response.data;
}

export async function trustRdpCertificate(
  id: string,
  fingerprint: string
): Promise<void> {
  await apiPost(`${endpoints.detail(id)}/rdp-certificate/trust`, {
    fingerprint,
  });
}

export async function reviewRdpSession(
  id: string
): Promise<{ busy: boolean; revision: string }> {
  const response = await apiGet<{ data: { busy: boolean; revision: string } }>(
    `${endpoints.detail(id)}/rdp-session`,
    { cache: "no-store" }
  );
  return response.data;
}

export async function fetchServerImages(
  id: string,
  signal: AbortSignal,
  imageId?: string
): Promise<ServerImages> {
  const suffix = imageId ? `/${encodeURIComponent(imageId)}` : "";
  const response = await apiGet<{ data: ServerImages }>(
    `${endpoints.detail(id)}/images${suffix}`,
    { cache: "no-store", signal }
  );
  return response.data;
}

export async function pruneServerImages(
  id: string,
  onChunk?: (chunk: string) => void,
  signal?: AbortSignal
): Promise<{ status: string; completedAt: string | null }> {
  if (!onChunk) {
    const response = await apiPost<{
      data: { status: string; completedAt: string | null };
    }>(`${endpoints.detail(id)}/images/prune`, undefined, {
      cache: "no-store",
      timeout: 45_000,
    });
    return response.data;
  }

  const headers = new Headers({
    Accept: "text/plain",
  });
  const token = localStorage.getItem("auth_token");
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const response = await fetch(
    `${endpoints.detail(id)}/images/prune?stream=true`,
    {
      method: "POST",
      headers,
      signal,
    }
  );
  if (!response.ok) {
    throw new Error(`Prune request failed with status ${response.status}`);
  }
  const reader = response.body?.getReader();
  if (!reader) {
    throw new Error("Response body is not readable");
  }
  const decoder = new TextDecoder();
  let fullOutput = "";
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    const text = decoder.decode(value, { stream: true });
    fullOutput += text;
    onChunk(text);
  }
  const finalChunk = decoder.decode();
  if (finalChunk) {
    fullOutput += finalChunk;
    onChunk(finalChunk);
  }
  const isError = fullOutput.includes("ERROR:");
  if (isError) {
    const match = fullOutput.match(PRUNE_ERROR_STATUS);
    const status = match ? match[1] : "ACTION_FAILED";
    return { status, completedAt: null };
  }
  return { status: "OK", completedAt: new Date().toISOString() };
}

export interface ContainerFileListing {
  content: string | null;
  entries: import("@/features/server-inventory/utils/terminal-file-browser").RemoteFileEntry[];
  path: string;
  status: string;
  truncated: boolean;
}

export async function fetchContainerFiles(
  id: string,
  containerId: string,
  mount: string,
  path: string,
  mode: "list" | "preview" | "download",
  signal: AbortSignal
): Promise<ContainerFileListing> {
  const query = new URLSearchParams({
    mount,
    path,
    mode,
  });
  const response = await apiGet<{ data: ContainerFileListing }>(
    `${endpoints.detail(id)}/containers/${encodeURIComponent(containerId)}/files?${query}`,
    { cache: "no-store", signal, timeout: 30_000 }
  );
  return response.data;
}
