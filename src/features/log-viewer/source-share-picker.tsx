import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import { Field, FieldDescription } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { discoverLogShares } from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import { SourceFieldLabel } from "@/features/log-viewer/source-field-label";
import type { LogSource, LogSourceRequest } from "@/features/log-viewer/types";

export function SourceSharePicker({
  request,
  source,
  disabled,
  portalContainer,
  onChange,
  onDetected,
}: {
  request: LogSourceRequest;
  source: LogSource | null;
  disabled: boolean;
  portalContainer: HTMLDivElement | null;
  onChange: (share: string) => void;
  onDetected: (share: string) => void;
}) {
  const {
    messages: { logViewer: copy },
  } = useI18n();
  const id = useId();
  const { host, port, username, domain, password, serverEntryId } = request;
  const sourceId = source?.id;
  const saved =
    !!source?.hasPassword &&
    source.host.toLowerCase() === host.trim().toLowerCase() &&
    source.port === port &&
    source.username === username.trim() &&
    source.domain === domain.trim();
  const ready =
    !!host.trim() &&
    !!username.trim() &&
    Number.isInteger(port) &&
    port > 0 &&
    port <= 65_535 &&
    (!!password || !!serverEntryId || saved);
  const automatic = ready && !password && (!!serverEntryId || saved);
  const [result, setResult] = useState<{
    shares: string[];
    limited: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);
  const discover = useCallback(async () => {
    controller.current?.abort();
    const current = new AbortController();
    controller.current = current;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const found = await discoverLogShares(
        {
          sourceId,
          serverEntryId,
          host,
          port,
          username,
          domain,
          password: password || undefined,
        },
        current.signal
      );
      if (!current.signal.aborted) {
        setResult(found);
        if (found.shares.length === 1 && !found.limited) {
          onDetected(found.shares[0]);
        }
      }
    } catch (cause) {
      if (!current.signal.aborted) {
        setError(getErrorMessage(cause));
      }
    } finally {
      if (controller.current === current) {
        controller.current = null;
        setLoading(false);
      }
    }
  }, [
    sourceId,
    serverEntryId,
    host,
    port,
    username,
    domain,
    password,
    onDetected,
  ]);
  useEffect(() => {
    setResult(null);
    setError(null);
    setLoading(false);
    if (automatic) {
      discover();
    }
    return () => {
      controller.current?.abort();
      controller.current = null;
    };
  }, [automatic, discover]);
  return (
    <Field data-disabled={disabled}>
      <SourceFieldLabel
        field="shareName"
        htmlFor={id}
        portalContainer={portalContainer}
      />
      <Combobox
        inputValue={request.shareName}
        items={result?.shares ?? []}
        onInputValueChange={(value, details) => {
          if (
            details.reason === "input-change" ||
            details.reason === "input-clear"
          ) {
            onChange(value);
          }
        }}
        onValueChange={(value) => {
          if (value) {
            onChange(value);
          }
        }}
        value={request.shareName || null}
      >
        <ComboboxInput
          disabled={disabled}
          id={id}
          maxLength={255}
          placeholder={copy.fieldHelp.shareName.placeholder}
          required
          triggerLabel={copy.sharesChoose}
        />
        <ComboboxContent portalContainer={portalContainer}>
          <ComboboxList>
            {(share: string) => (
              <ComboboxItem key={share} value={share}>
                {share}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
      <div className="flex items-center gap-2">
        <Button
          disabled={disabled || !ready || loading}
          onClick={discover}
          size="sm"
          type="button"
          variant="outline"
        >
          {loading && <Spinner />}
          {loading ? copy.sharesLoading : copy.sharesDiscover}
        </Button>
      </div>
      <FieldDescription>
        {result ? copy.sharesChoose : copy.sharesHint}
      </FieldDescription>
      {result?.shares.length === 0 && (
        <FieldDescription>{copy.sharesEmpty}</FieldDescription>
      )}
      {result?.limited && (
        <FieldDescription>{copy.sharesLimited}</FieldDescription>
      )}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>
            {copy.sharesFailed} {error}
          </AlertDescription>
        </Alert>
      )}
    </Field>
  );
}
