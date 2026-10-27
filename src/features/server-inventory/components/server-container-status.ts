import { useI18n } from "@/components/i18n-provider";
import { getErrorMessage } from "@/lib/error-handler";

export function containerVariant(state: string, status: string) {
  if (status.includes("unhealthy")) {
    return "destructive";
  }
  return state === "running" ? "success" : "secondary";
}

export function useContainerError(
  status: string | undefined,
  error: Error | null
) {
  const { messages } = useI18n();
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
  ]);
  if (error) {
    return getErrorMessage(error);
  }
  if (!status || status === "OK") {
    return;
  }
  return errors.get(status) ?? copy.collectionFailed;
}
