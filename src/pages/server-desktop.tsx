import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router";
import { toast } from "sonner";
import { useI18n } from "@/components/i18n-provider";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { fetchServerEntry } from "@/features/server-inventory/api";
import { useServerDesktop } from "@/features/server-inventory/hooks/use-server-desktop";
import type { ServerEntry } from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";

function DesktopSession({ entry }: { entry: ServerEntry }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  useDocumentMeta({ title: `${entry.name} | RDP` });
  const [attempt, setAttempt] = useState(0);
  const rootRef = useRef<HTMLElement>(null);
  const [fullscreen, setFullscreen] = useState(false);
  const {
    sessionWarning,
    continueSession,
    certificate,
    trustBusy,
    trustError,
    continueCertificate,
    cancelCertificate,
    containerRef,
    disconnectButtonRef,
    status,
    error,
    unstable,
    disconnect,
    sendCtrlAltDelete,
  } = useServerDesktop(entry.id, attempt);
  const statusLabel = {
    connecting: copy.rdpConnecting,
    connected: unstable ? copy.rdpUnstable : copy.rdpConnected,
    disconnected: copy.rdpDisconnected,
  }[status];

  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === rootRef.current);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await rootRef.current?.requestFullscreen();
      }
    } catch {
      toast.error(copy.rdpFullscreenFailed);
    }
  }

  return (
    <main className="flex h-dvh flex-col bg-background" ref={rootRef}>
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            cancelCertificate();
          }
        }}
        open={sessionWarning}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.rdpSessionWarningTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {copy.rdpSessionWarningDescription}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button onClick={cancelCertificate} variant="outline">
              {copy.rdpCertificateCancel}
            </Button>
            <Button onClick={continueSession}>
              {copy.rdpCertificateContinue}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        onOpenChange={(open) => {
          if (!(open || trustBusy)) {
            cancelCertificate();
          }
        }}
        open={certificate !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.rdpCertificateTitle}</AlertDialogTitle>
            <AlertDialogDescription>
              {entry.host}:{entry.port ?? 3389}.{" "}
              {certificate?.previousFingerprint
                ? copy.rdpCertificateChanged
                : copy.rdpCertificateWarning}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <details className="min-w-0 text-sm">
            <summary className="cursor-pointer font-medium">
              {copy.rdpShowCertificate}
            </summary>
            <dl className="mt-3 space-y-2 break-all text-muted-foreground">
              <dt>{copy.rdpCertificateSubject}</dt>
              <dd>{certificate?.certificate.subject}</dd>
              <dt>{copy.rdpCertificateIssuer}</dt>
              <dd>{certificate?.certificate.issuer}</dd>
              <dt>{copy.rdpCertificateValidity}</dt>
              <dd>
                {certificate?.certificate.validFrom} /{" "}
                {certificate?.certificate.validUntil}
              </dd>
              <dt>SHA-256</dt>
              <dd className="font-mono text-xs">
                {certificate?.certificate.fingerprint}
              </dd>
              {certificate?.previousFingerprint && (
                <>
                  <dt>{copy.rdpCertificatePrevious}</dt>
                  <dd className="font-mono text-xs">
                    {certificate.previousFingerprint}
                  </dd>
                </>
              )}
            </dl>
          </details>
          {!certificate?.canTrust && (
            <p className="text-destructive text-sm" role="alert">
              {copy.rdpCertificateManaged}
            </p>
          )}
          {trustError && (
            <p className="text-destructive text-sm" role="alert">
              {trustError}
            </p>
          )}
          <AlertDialogFooter>
            <Button
              disabled={trustBusy}
              onClick={cancelCertificate}
              variant="outline"
            >
              {copy.rdpCertificateCancel}
            </Button>
            <Button
              disabled={trustBusy || !certificate?.canTrust}
              onClick={continueCertificate}
            >
              {trustBusy
                ? copy.rdpCertificateSaving
                : copy.rdpCertificateContinue}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="truncate font-semibold text-base">{entry.name}</h1>
          <p className="truncate font-mono text-muted-foreground text-xs">
            {entry.username}@{entry.host}:{entry.port ?? 3389}
          </p>
        </div>
        <p
          aria-live="polite"
          className="text-muted-foreground text-sm"
          role="status"
        >
          {statusLabel}
        </p>
        <div className="flex flex-wrap gap-2">
          <Button
            disabled={status !== "connected"}
            onClick={sendCtrlAltDelete}
            size="sm"
            variant="outline"
          >
            {copy.rdpCtrlAltDelete}
          </Button>
          <Button
            aria-pressed={fullscreen}
            onClick={toggleFullscreen}
            size="sm"
            variant="outline"
          >
            {fullscreen ? copy.rdpExitFullscreen : copy.rdpFullscreen}
          </Button>
          <Button
            onClick={
              status === "disconnected"
                ? () => setAttempt((value) => value + 1)
                : disconnect
            }
            ref={disconnectButtonRef}
            size="sm"
            variant="outline"
          >
            {status === "disconnected" ? copy.sshReconnect : copy.sshDisconnect}
          </Button>
        </div>
      </header>
      {error && (
        <p
          className="border-b bg-destructive/10 px-4 py-3 text-destructive text-sm"
          role="alert"
        >
          {error}
        </p>
      )}
      {status === "disconnected" && !error && (
        <p className="border-b px-4 py-3 text-muted-foreground text-sm">
          {copy.rdpSessionEnded}
        </p>
      )}
      <div className="relative min-h-0 flex-1 overflow-hidden bg-muted/30">
        <section
          aria-describedby="rdp-desktop-help"
          aria-label={copy.rdpDesktopTitle}
          className="server-rdp-viewport"
          ref={containerRef}
        />
        {status === "connecting" && (
          <p
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-4 text-muted-foreground text-sm"
            role="status"
          >
            {copy.rdpDesktopLoading}
          </p>
        )}
      </div>
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2 text-muted-foreground text-xs">
        <p id="rdp-desktop-help">{copy.rdpDesktopHelp}</p>
        <Link
          className="text-primary underline underline-offset-4"
          to="/dashboard/servers"
        >
          {copy.sshBackToInventory}
        </Link>
      </footer>
    </main>
  );
}

export function ServerDesktopPage() {
  const { serverId = "" } = useParams();
  const { messages } = useI18n();
  const copy = messages.servers;
  const query = useQuery({
    queryKey: ["server-desktop", serverId],
    queryFn: () => fetchServerEntry(serverId),
    retry: false,
  });
  if (query.isPending) {
    return (
      <p className="p-6 text-muted-foreground" role="status">
        {copy.sshLoading}
      </p>
    );
  }
  if (
    query.isError ||
    query.data.accessType.toUpperCase() !== "RDP" ||
    !query.data.username ||
    !query.data.hasPassword
  ) {
    return (
      <main className="space-y-4 p-6">
        <p role="alert">
          {query.isError ? copy.sshLoadFailed : copy.rdpCredentialsRequired}
        </p>
        <Button render={<Link to="/dashboard/servers" />} variant="outline">
          {copy.sshBackToInventory}
        </Button>
      </main>
    );
  }
  return <DesktopSession entry={query.data} key={query.data.id} />;
}
