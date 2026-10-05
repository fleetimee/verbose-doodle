import { useEffect, useState } from "react";
import { toast } from "sonner";
import { CopyIcon, Eye } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { revealServerPassword } from "@/features/server-inventory/api";
import type { ServerEntry } from "@/features/server-inventory/types";
import { copyToClipboard } from "@/lib/clipboard";
import { getErrorMessage } from "@/lib/error-handler";
import { formatMessage } from "@/lib/i18n";

export function ServerPasswordCell({
  entry,
  isAdmin,
  loading,
  revealAll,
  bulkPassword,
}: {
  entry: ServerEntry;
  isAdmin: boolean;
  loading: boolean;
  revealAll: boolean;
  bulkPassword?: string;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [requested, setRequested] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setRequested(false);
    setPassword(null);
    setHidden(false);
  }, [entry, loading, revealAll]);

  useEffect(() => {
    if (!(requested && isAdmin) || loading) {
      return;
    }
    let active = true;
    const hide = () => {
      setRequested(false);
      setPassword(null);
      setHidden(true);
    };
    const timer = window.setTimeout(hide, 30_000);
    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        hide();
      }
    };
    document.addEventListener("visibilitychange", onVisibility);
    revealServerPassword(entry.id)
      .then((value) => {
        if (active) {
          setPassword(value);
          toast.success(
            formatMessage(copy.passwordRevealed, { name: entry.name })
          );
        }
      })
      .catch((cause: unknown) => {
        if (active) {
          hide();
          toast.error(getErrorMessage(cause));
        }
      });
    return () => {
      active = false;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [
    requested,
    isAdmin,
    loading,
    entry.id,
    entry.name,
    copy.passwordRevealed,
  ]);

  const selectedPassword = revealAll ? (bulkPassword ?? null) : password;
  const visiblePassword =
    isAdmin && !loading && !hidden ? selectedPassword : null;
  const hideLabel = formatMessage(copy.hidePasswordFor, { name: entry.name });
  const hide = () => {
    setRequested(false);
    setPassword(null);
    setHidden(true);
    toast.success(copy.passwordHidden);
  };
  const copyPassword = async () => {
    if (visiblePassword === null) {
      return;
    }
    try {
      if (!(await copyToClipboard(visiblePassword))) {
        throw new Error(copy.copyFailed);
      }
      toast.success(copy.copied);
    } catch {
      toast.error(copy.copyFailed);
    }
  };

  if (!entry.hasPassword) {
    return <span className="text-muted-foreground">{copy.notSet}</span>;
  }
  if (visiblePassword !== null) {
    return (
      <div className="flex items-center gap-1">
        <span className="min-w-0 flex-1 truncate whitespace-pre font-mono text-xs">
          {visiblePassword}
        </span>
        <Button
          aria-label={formatMessage(copy.copyPasswordFor, { name: entry.name })}
          className="shrink-0"
          onClick={copyPassword}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <CopyIcon />
        </Button>
        <Button
          aria-label={hideLabel}
          className="shrink-0"
          onClick={hide}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <Eye />
        </Button>
      </div>
    );
  }
  return isAdmin ? (
    <div className="flex items-center gap-1">
      <span className="min-w-0 flex-1 font-mono">••••••••</span>
      <Button
        aria-label={
          requested
            ? hideLabel
            : formatMessage(copy.revealFor, { name: entry.name })
        }
        className="shrink-0"
        disabled={loading}
        onClick={
          requested
            ? hide
            : () => {
                setHidden(false);
                if (revealAll && bulkPassword !== undefined) {
                  toast.success(
                    formatMessage(copy.passwordRevealed, { name: entry.name })
                  );
                } else {
                  setRequested(true);
                }
              }
        }
        size="icon-sm"
        type="button"
        variant="ghost"
      >
        {requested ? <Spinner /> : <Eye />}
      </Button>
    </div>
  ) : (
    <span className="font-mono">
      <span aria-hidden="true">••••••••</span>
      <span className="sr-only">{copy.passwordStored}</span>
    </span>
  );
}
