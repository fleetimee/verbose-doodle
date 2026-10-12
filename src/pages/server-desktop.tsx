import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
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
import { ServerDesktopToolbar } from "@/features/server-inventory/components/server-desktop-toolbar";
import { useServerDesktop } from "@/features/server-inventory/hooks/use-server-desktop";
import type { ServerEntry } from "@/features/server-inventory/types";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { copyToClipboard } from "@/lib/clipboard";

function DesktopSession({ entry }: { entry: ServerEntry }) {
  const { messages } = useI18n();
  const copy = messages.servers;
  useDocumentMeta({ title: `${entry.name} | RDP` });
  const [attempt, setAttempt] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const {
    clipboardText,
    disconnectNotice,
    dismissDisconnectNotice,
    sessionWarning,
    continueSession,
    certificate,
    trustBusy,
    trustError,
    continueCertificate,
    cancelCertificate,
    containerRef,
    disconnectButtonRef,
    keyboardInputRef,
    status,
    error,
    unstable,
    disconnect,
    sendShortcut,
    chooseUpload,
    cancelUpload,
    uploadBusy,
  } = useServerDesktop(entry.id, attempt);
  const statusLabel = {
    connecting: copy.rdpConnecting,
    connected: unstable ? copy.rdpUnstable : copy.rdpConnected,
    disconnected: copy.rdpDisconnected,
  }[status];

  useEffect(() => {
    const update = () =>
      setFullscreen(document.fullscreenElement === document.documentElement);
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, []);

  async function toggleFullscreen() {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      } else {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      toast.error(copy.rdpFullscreenFailed);
    }
  }

  return (
    <main className="flex h-dvh flex-col bg-background">
      <AlertDialog
        onOpenChange={(open) => {
          if (!open) {
            dismissDisconnectNotice();
          }
        }}
        open={disconnectNotice !== null}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{copy.rdpDisconnectDialogTitle}</AlertDialogTitle>
            <AlertDialogDescription>{disconnectNotice}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button
              onClick={dismissDisconnectNotice}
              size="sm-compact"
              variant="outline"
            >
              {messages.common.close}
            </Button>
            <Button
              onClick={() => {
                dismissDisconnectNotice();
                setAttempt((value) => value + 1);
              }}
              size="sm-compact"
            >
              {copy.sshReconnect}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
            <Button
              onClick={cancelCertificate}
              size="sm-compact"
              variant="outline"
            >
              {copy.rdpCertificateCancel}
            </Button>
            <Button onClick={continueSession} size="sm-compact">
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
            <dl className="mt-3 flex flex-col gap-2 break-all text-muted-foreground">
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
              size="sm-compact"
              variant="outline"
            >
              {copy.rdpCertificateCancel}
            </Button>
            <Button
              disabled={trustBusy || !certificate?.canTrust}
              onClick={continueCertificate}
              size="sm-compact"
            >
              {trustBusy
                ? copy.rdpCertificateSaving
                : copy.rdpCertificateContinue}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <ServerDesktopToolbar
        connected={status === "connected"}
        disconnectButtonRef={disconnectButtonRef}
        disconnected={status === "disconnected"}
        entry={entry}
        fullscreen={fullscreen}
        keyboardInputRef={keyboardInputRef}
        onCancelUpload={cancelUpload}
        onDisconnect={disconnect}
        onReconnect={() => setAttempt((value) => value + 1)}
        onShortcut={sendShortcut}
        onToggleFullscreen={toggleFullscreen}
        onUpload={chooseUpload}
        statusLabel={statusLabel}
        unstable={unstable}
        uploadBusy={uploadBusy}
      />
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
        <Button
          disabled={status !== "connected" || clipboardText === null}
          onClick={async () => {
            try {
              if (
                clipboardText !== null &&
                (await copyToClipboard(clipboardText))
              ) {
                toast.success(copy.copied);
              } else {
                toast.error(copy.copyFailed);
              }
            } catch {
              toast.error(copy.copyFailed);
            }
          }}
          size="sm-compact"
          variant="outline"
        >
          {copy.rdpCopyClipboard}
        </Button>
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
      <main className="flex flex-col gap-4 p-6">
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
