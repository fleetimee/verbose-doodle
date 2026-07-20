import type {
  RelayEventLog,
  RelayInstance,
  RelayStartInput,
  RelayUpdateOptionsInput,
} from "@/features/socks-relay/types";
import { apiGet, apiPatch, apiPost } from "@/lib/api";

type ApiEnvelope<TData> = {
  readonly responseCode: string;
  readonly responseDesc: string;
  readonly data: TData;
};

type RelayListData = {
  readonly relays: RelayInstance[];
};

type RelayDetailData = {
  readonly relay: RelayInstance;
};

type RelayLogsData = {
  readonly logs: RelayEventLog[];
};

export async function listRelays(): Promise<RelayInstance[]> {
  const response = await apiGet<ApiEnvelope<RelayListData>>("/api/relay");
  return response.data.relays;
}

export async function getRelay(relayId: string): Promise<RelayInstance> {
  const response = await apiGet<ApiEnvelope<RelayDetailData>>(
    `/api/relay/${encodeURIComponent(relayId)}`
  );
  return response.data.relay;
}

export async function listRelayLogs(): Promise<RelayEventLog[]> {
  const response = await apiGet<ApiEnvelope<RelayLogsData>>("/api/relay/logs");
  return response.data.logs;
}

export async function startRelay(
  input: RelayStartInput
): Promise<RelayInstance> {
  const response = await apiPost<ApiEnvelope<RelayDetailData>, RelayStartInput>(
    "/api/relay/start",
    input
  );
  return response.data.relay;
}

export async function stopRelay(relayId: string): Promise<RelayInstance> {
  const response = await apiPost<ApiEnvelope<RelayDetailData>>(
    `/api/relay/${encodeURIComponent(relayId)}/stop`
  );
  return response.data.relay;
}

export async function updateRelayOptions({
  options,
  relayId,
}: {
  readonly options: RelayUpdateOptionsInput;
  readonly relayId: string;
}): Promise<RelayInstance> {
  const response = await apiPatch<
    ApiEnvelope<RelayDetailData>,
    RelayUpdateOptionsInput
  >(`/api/relay/${encodeURIComponent(relayId)}/options`, options);
  return response.data.relay;
}
