import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
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
import { Spinner } from "@/components/ui/spinner";
import { pruneServerImages } from "@/features/server-inventory/api";
import { useContainerError } from "@/features/server-inventory/components/server-container-status";
import type { ServerEntry } from "@/features/server-inventory/types";
import { formatMessage } from "@/lib/i18n";

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
  const queryClient = useQueryClient();
  const mutation = useMutation({
    mutationFn: () => pruneServerImages(entry.id),
    retry: false,
    onSuccess: (result) => {
      if (result.status === "OK") {
        setOpen(false);
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
  return (
    <>
      <Button
        disabled={disabled || mutation.isPending}
        onClick={() => {
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
        <AlertDialogContent size="sm">
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
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={mutation.isPending}>
              {messages.common.cancel}
            </AlertDialogCancel>
            <Button
              disabled={mutation.isPending}
              onClick={() => mutation.mutate()}
              variant="destructive"
            >
              {mutation.isPending && <Spinner data-icon="inline-start" />}
              {mutation.isPending ? copy.pruneWorking : copy.prune}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
