import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { Trash2 } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { pruneServerImages } from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import type { ServerEntry } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

const PRUNE_CONTROL_MARKER = /\n?(SUCCESS|ERROR:[^\n]*)\s*$/;

export function ServerImageCleanup({
  entry,
  disabled,
  onRefresh,
}: {
  entry: ServerEntry;
  disabled: boolean;
  onRefresh: () => Promise<void>;
}) {
  const { messages } = useI18n();
  const copy = messages.servers.images;
  const [open, setOpen] = useState(false);
  const [logs, setLogs] = useState("");
  const viewportRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (viewportRef.current && logs) {
      viewportRef.current.scrollTop = viewportRef.current.scrollHeight;
    }
  }, [logs]);

  const mutation = useMutation({
    mutationFn: () =>
      pruneServerImages(entry.id, (chunk) => {
        setLogs((prev) => prev + chunk);
      }),
    retry: false,
    onSuccess: (result) => {
      if (result.status === "OK") {
        toast.success(copy.pruneSuccess);
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: ["server-inventory"] });
      await onRefresh();
    },
  });

  const statusError = useContainerError(mutation.data?.status, mutation.error);
  const error =
    mutation.data?.status === "ACTION_FAILED" ? copy.pruneFailed : statusError;
  const displayLogs = logs.replace(PRUNE_CONTROL_MARKER, "").trim();
  const isDone =
    !mutation.isPending && mutation.isSuccess && mutation.data?.status === "OK";

  return (
    <>
      <Button
        disabled={disabled || mutation.isPending}
        onClick={() => {
          setLogs("");
          mutation.reset();
          setOpen(true);
        }}
        size="sm"
        variant="tool-destructive"
      >
        <Trash2 data-icon="inline-start" />
        {copy.prune}
      </Button>
      <AlertDialog
        onOpenChange={(next) => {
          if (!mutation.isPending) {
            setOpen(next);
          }
        }}
        open={open}
      >
        <AlertDialogContent className="sm:max-w-lg" size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {formatMessage(copy.pruneTitle, {
                host: `${entry.name} (${entry.host})`,
              })}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {copy.pruneDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          {(mutation.isPending || logs) && (
            <ScrollArea
              className="h-56 w-full min-w-0 max-w-full"
              variant="panel"
              viewportRef={viewportRef}
            >
              <pre className="min-w-max whitespace-pre break-normal p-3 font-mono text-foreground text-xs leading-5">
                {displayLogs || copy.pruneWorking}
              </pre>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          )}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            {isDone ? (
              <Button onClick={() => setOpen(false)}>
                {messages.common.close}
              </Button>
            ) : (
              <>
                <AlertDialogCancel disabled={mutation.isPending}>
                  {messages.common.cancel}
                </AlertDialogCancel>
                <Button
                  disabled={mutation.isPending}
                  onClick={() => {
                    setLogs("");
                    mutation.mutate();
                  }}
                  variant="destructive"
                >
                  {mutation.isPending && <Spinner data-icon="inline-start" />}
                  {mutation.isPending ? copy.pruneWorking : copy.prune}
                </Button>
              </>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
