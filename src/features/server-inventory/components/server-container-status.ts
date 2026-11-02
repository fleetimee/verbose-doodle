import { useI18n } from "@/components/i18n-provider";
import {
  isInspectObject,
  isInspectString,
} from "@/features/server-inventory/container-inspect-values";
import type { ServerContainerDetail } from "@/features/server-inventory/types";
import { getErrorMessage } from "@/lib/error-handler";

type ContainerCopy = ReturnType<
  typeof useI18n
>["messages"]["servers"]["containers"];

export type ContainerStatusKind =
  | "healthy"
  | "unhealthy"
  | "running"
  | "stopped";

export function inspectHealthStatus(data?: ServerContainerDetail): string {
  const state = data?.inspect?.State;
  const health = isInspectObject(state) ? state.Health : undefined;
  const status = isInspectObject(health) ? health.Status : undefined;
  return isInspectString(status) ? status : "";
}

interface ContainerStatus {
  kind: ContainerStatusKind;
  label: string;
}

export function resolveContainerStatus(
  state: string,
  status: string,
  copy: ContainerCopy
): ContainerStatus {
  const normalized = status.toLowerCase();
  if (normalized.includes("unhealthy")) {
    return { kind: "unhealthy", label: copy.unhealthy };
  }
  if (normalized.includes("healthy")) {
    return { kind: "healthy", label: copy.healthy };
  }
  const states: Record<string, string> = copy.states;
  if (state === "running") {
    return { kind: "running", label: states.running ?? state };
  }
  return { kind: "stopped", label: states[state] ?? state };
}

export function useContainerError(
  status: string | undefined,
  error: Error | null
) {
  const { messages } = useI18n();
  if (error) {
    return getErrorMessage(error);
  }
  return containerStatusError(status, messages);
}

export function containerStatusError(
  status: string | undefined,
  messages: ReturnType<typeof useI18n>["messages"]
) {
  const copy = messages.servers.containers;
  const errors = new Map([
    ["HOST_KEY_REQUIRED", messages.servers.metrics.hostKeyRequired],
    ["HOST_KEY_REJECTED", messages.servers.sshHostKeyRejected],
    ["AUTH_FAILED", messages.servers.sshAuthFailed],
    ["CONNECTION_FAILED", messages.servers.sshConnectionFailed],
    ["DOCKER_NOT_INSTALLED", copy.notInstalled],
    ["DOCKER_UNAVAILABLE", copy.dockerUnavailable],
    ["UNSUPPORTED_OS", messages.servers.metrics.unsupported],
    ["BUSY", messages.servers.metrics.busy],
    ["LIMIT_EXCEEDED", copy.limitExceeded],
    ["CONTAINER_NOT_FOUND", copy.notFound],
    ["INVALID_STATE", copy.invalidState],
    ["ACTION_FAILED", copy.actionFailed],
    ["FILE_TOO_LARGE", copy.volumeFileTooLarge],
    ["FILE_PREVIEW_TOO_LARGE", copy.volumePreviewTooLarge],
    ["PATH_OUTSIDE_MOUNT", copy.volumeOutsideMount],
    ["FILE_UNAVAILABLE", copy.volumeUnavailable],
    ["FILE_TOOLS_UNAVAILABLE", copy.volumeMissingTools],
    ["FILE_PERMISSION_DENIED", copy.volumePermissionDenied],
    ["FILE_NOT_FOUND", copy.volumeNotFound],
  ]);
  if (!status || status === "OK") {
    return;
  }
  return errors.get(status) ?? copy.collectionFailed;
}
