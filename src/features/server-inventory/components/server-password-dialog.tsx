import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyIcon } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { revealServerPassword } from "@/features/server-inventory/api";
import type { ServerEntry } from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage } from "@/lib/i18n";

export function ServerPasswordDialog({
  entry,
  onClose,
}: {
  entry: ServerEntry;
  onClose: () => void;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [password, setPassword] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    revealServerPassword(entry.id)
      .then((value) => {
        if (active) {
          setPassword(value);
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          setError(getErrorMessage(cause));
        }
      });
    return () => {
      active = false;
    };
  }, [entry.id, attempt]);

  useEffect(() => {
    const timer = window.setTimeout(onClose, 30_000);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  useEffect(() => {
    const hide = () => {
      if (document.visibilityState === "hidden") {
        onClose();
      }
    };
    document.addEventListener("visibilitychange", hide);
    return () => document.removeEventListener("visibilitychange", hide);
  }, [onClose]);

  const copyPassword = async () => {
    if (password === null) {
      return;
    }
    try {
      if (!(await copyToClipboard(password))) {
        throw new Error(copy.copyFailed);
      }
      toast.success(copy.copied);
    } catch {
      toast.error(copy.copyFailed);
    }
  };

  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
      open
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {formatMessage(copy.passwordTitle, { name: entry.name })}
          </DialogTitle>
          <DialogDescription>{copy.revealDescription}</DialogDescription>
        </DialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!error && password === null && <Skeleton className="h-12 w-full" />}
        {!error && password !== null && (
          <output
            aria-label={copy.password}
            className="break-all rounded-md border bg-muted p-3 font-mono text-sm"
          >
            {password}
          </output>
        )}
        <DialogFooter>
          <Button onClick={onClose} variant="outline">
            {copy.hidePassword}
          </Button>
          {error ? (
            <Button
              onClick={() => {
                setError(null);
                setAttempt(attempt + 1);
              }}
            >
              {copy.retry}
            </Button>
          ) : (
            <Button disabled={password === null} onClick={copyPassword}>
              <CopyIcon data-icon="inline-start" />
              {copy.copyPassword}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
