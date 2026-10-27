import {
  CommandLineIcon,
  RefreshCcwIcon,
  StopIcon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "react-router";
import { toast } from "sonner";
import { Play, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { runServerContainerAction } from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import type { ServerEntry } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

type ContainerAction = "start" | "stop" | "restart";

export function ServerContainerActions({
  entry,
  containerId,
  name,
  state,
  refreshing,
  onRefresh,
}: {
  entry: ServerEntry;
  containerId: string;
  name: string;
  state: string | null;
  refreshing: boolean;
  onRefresh: () => Promise<void>;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.containers;
  const queryClient = useQueryClient();
  const [confirm, setConfirm] = useState<"stop" | "restart" | null>(null);
  const mutation = useMutation({
    mutationFn: (action: ContainerAction) =>
      runServerContainerAction(entry.id, containerId, action),
    retry: false,
    onMutate: () =>
      queryClient.cancelQueries({
        queryKey: ["server-inventory", "container-detail", entry.id],
      }),
    onSuccess: (result) => {
      if (result.status === "OK") {
        toast.success(copy.actionSuccess);
      }
    },
    onSettled: async () => {
      setConfirm(null);
      await queryClient.invalidateQueries({ queryKey: ["server-inventory"] });
      await onRefresh();
    },
  });
  const error = useContainerError(mutation.data?.status, mutation.error);
  const eligible = Boolean(entry.hasPassword && entry.username);
  const running = state === "running";
  const canStart = state === "created" || state === "exited";
  const actions: ContainerAction[] = running ? ["stop", "restart"] : [];
  if (canStart) {
    actions.push("start");
  }
  const labels = { start: copy.start, stop: copy.stop, restart: copy.restart };
  return (
    <div className="flex flex-col gap-3">
      <ButtonGroup aria-label={messages.servers.actions}>
        {running && eligible && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                aria-label={copy.exec}
                disabled={mutation.isPending}
                render={
                  <Link
                    rel="noopener noreferrer"
                    target="_blank"
                    to={`/servers/${entry.id}/containers/${containerId}/terminal`}
                  />
                }
                size="sm"
                variant="outline"
              >
                <HugeiconsIcon
                  aria-hidden="true"
                  data-icon="inline-start"
                  icon={CommandLineIcon}
                />
                {copy.exec}
              </Button>
            </TooltipTrigger>
            <TooltipContent>{copy.exec}</TooltipContent>
          </Tooltip>
        )}
        {eligible &&
          actions.map((action) => (
            <Tooltip key={action}>
              <TooltipTrigger asChild>
                <Button
                  aria-label={labels[action]}
                  disabled={mutation.isPending}
                  onClick={() => {
                    mutation.reset();
                    if (action === "start") {
                      mutation.mutate(action);
                    } else {
                      setConfirm(action);
                    }
                  }}
                  size={action === "restart" ? "sm" : "icon-sm"}
                  variant={action === "stop" ? "tool-destructive" : "outline"}
                >
                  {action === "start" && <Play data-icon="inline-start" />}
                  {action === "stop" && (
                    <HugeiconsIcon
                      aria-hidden="true"
                      data-icon="inline-start"
                      icon={StopIcon}
                    />
                  )}
                  {action === "restart" && (
                    <>
                      <HugeiconsIcon
                        aria-hidden="true"
                        data-icon="inline-start"
                        icon={RefreshCcwIcon}
                      />
                      {labels.restart}
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{labels[action]}</TooltipContent>
            </Tooltip>
          ))}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              aria-label={copy.refreshDetails}
              disabled={refreshing || mutation.isPending}
              onClick={() => onRefresh()}
              size="icon-sm"
              variant="outline"
            >
              {refreshing || mutation.isPending ? (
                <Spinner data-icon="inline-start" />
              ) : (
                <RefreshCw data-icon="inline-start" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>{copy.refreshDetails}</TooltipContent>
        </Tooltip>
      </ButtonGroup>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <AlertDialog
        onOpenChange={(open) => {
          if (!(open || mutation.isPending)) {
            setConfirm(null);
          }
        }}
        open={confirm !== null}
      >
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirm === "stop" ? copy.stopTitle : copy.restartTitle}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {formatMessage(
                confirm === "stop"
                  ? copy.stopDescription
                  : copy.restartDescription,
                { name, host: entry.host }
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              {messages.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={mutation.isPending || confirm === null}
              onClick={() => {
                if (confirm) {
                  mutation.mutate(confirm);
                }
              }}
              variant={confirm === "stop" ? "destructive" : "default"}
            >
              {mutation.isPending
                ? copy.actionWorking
                : labels[confirm ?? "stop"]}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
