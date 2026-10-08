import type {
  ServerEntry,
  ServerEntryPage,
  ServerEntryRequest,
  ServerInventoryQuery,
} from "@/features/server-inventory/types";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { API_ENDPOINTS } from "@/lib/api-endpoints";

const endpoints = API_ENDPOINTS.admin.servers;

export async function fetchServerEntries(
  query: ServerInventoryQuery
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
    `${endpoints.list}?${params}`
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

export async function fetchServerEntry(id: string): Promise<ServerEntry> {
  const response = await apiGet<{ data: { server: ServerEntry } }>(
    endpoints.detail(id)
  );
  return response.data.server;
}
