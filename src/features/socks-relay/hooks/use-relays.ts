import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  listRelayLogs,
  listRelays,
  startRelay,
  stopRelay,
  updateRelayOptions,
} from "@/features/socks-relay/api/relay-api";
import { socksRelayQueryKeys } from "@/features/socks-relay/query-keys";
import type {
  RelayEventLog,
  RelayInstance,
  RelayStartInput,
  RelayUpdateOptionsInput,
} from "@/features/socks-relay/types";
import { getModeLabel } from "@/features/socks-relay/utils";
import type { ApiError } from "@/lib/api";
import { TIME_DURATIONS } from "@/lib/constants";
import { formatMessage, messages } from "@/lib/i18n";
import { createMutationHook, createQueryHook } from "@/lib/query-hooks";

const RELAY_LOG_REFRESH_INTERVAL_MS = 10_000;

export function useGetRelays() {
  const useQuery = createQueryHook<RelayInstance[]>({
    options: {
      staleTime: TIME_DURATIONS.ONE_MINUTE,
    },
    queryFn: listRelays,
    queryKey: socksRelayQueryKeys.all,
  });

  return useQuery();
}

export function useGetRelayLogs() {
  const useQuery = createQueryHook<RelayEventLog[]>({
    options: {
      refetchInterval: RELAY_LOG_REFRESH_INTERVAL_MS,
      staleTime: RELAY_LOG_REFRESH_INTERVAL_MS,
    },
    queryFn: listRelayLogs,
    queryKey: socksRelayQueryKeys.logs(),
  });

  return useQuery();
}

export function useStartRelay() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<RelayInstance, RelayStartInput, ApiError>(
    startRelay,
    {
      onError: (error) => {
        toast.error(messages.socksRelay.failedStartRelay, {
          description: error.message,
        });
      },
      onSuccess: (relay) => {
        const modeLabel = getModeLabel(relay.mode);
        toast.success(
          formatMessage(messages.socksRelay.relayStarted, { modeLabel }),
          {
            description: formatMessage(
              messages.socksRelay.relayStartedDescription,
              {
                port: relay.listeningPort,
                relayId: relay.relayId,
              }
            ),
          }
        );
        queryClient.invalidateQueries({ queryKey: socksRelayQueryKeys.all });
      },
    }
  );

  return mutation();
}

export function useStopRelay() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<RelayInstance, string, ApiError>(
    stopRelay,
    {
      onError: (error) => {
        toast.error(messages.socksRelay.failedStopRelay, {
          description: error.message,
        });
      },
      onSuccess: (relay) => {
        toast.success(messages.socksRelay.relayStopped, {
          description: relay.relayId,
        });
        queryClient.invalidateQueries({ queryKey: socksRelayQueryKeys.all });
      },
    }
  );

  return mutation();
}

export function useUpdateRelayOptions() {
  const queryClient = useQueryClient();
  const mutation = createMutationHook<
    RelayInstance,
    { readonly options: RelayUpdateOptionsInput; readonly relayId: string },
    ApiError
  >(updateRelayOptions, {
    onError: (error) => {
      toast.error(messages.socksRelay.failedUpdateRelayOptions, {
        description: error.message,
      });
    },
    onSuccess: (relay) => {
      toast.success(messages.socksRelay.relayUpdated, {
        description: relay.relayId,
      });
      queryClient.invalidateQueries({ queryKey: socksRelayQueryKeys.all });
      queryClient.invalidateQueries({
        queryKey: socksRelayQueryKeys.detail(relay.relayId),
      });
    },
  });

  return mutation();
}
