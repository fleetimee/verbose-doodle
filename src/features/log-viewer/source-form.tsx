import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Check, RefreshCw } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLegend,
  FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { browseLogFolder } from "@/features/log-viewer/api";
import { getLogErrorMessage as getErrorMessage } from "@/features/log-viewer/error-message";
import { SourceFieldLabel } from "@/features/log-viewer/source-field-label";
import { SourceFolderBrowser } from "@/features/log-viewer/source-folder-browser";
import { SourceServerPicker } from "@/features/log-viewer/source-server-picker";
import { SourceSharePicker } from "@/features/log-viewer/source-share-picker";
import type { LogSource, LogSourceRequest } from "@/features/log-viewer/types";
import type { ServerEntry } from "@/features/server-inventory/types";

export function SourceForm({
  source,
  onSave,
  onCancel,
}: {
  source: LogSource | null;
  onSave: (request: LogSourceRequest) => Promise<void>;
  onCancel: () => void;
}) {
  const { messages } = useI18n();
  const copy = messages.logViewer;
  const prefix = useId();
  const [form, setForm] = useState<LogSourceRequest>(() => {
    if (!source) {
      return {
        name: "",
        host: "",
        port: 445,
        shareName: "",
        basePath: "",
        folderPattern: "",
        filenamePattern: "",
        username: "",
        domain: "",
        password: "",
        encoding: "UTF-8",
        timezone: "",
      };
    }
    return {
      name: source.name,
      host: source.host,
      port: source.port,
      shareName: source.shareName,
      basePath: source.basePath,
      folderPattern: source.folderPattern,
      filenamePattern: source.filenamePattern,
      username: source.username,
      domain: source.domain,
      encoding: source.encoding,
      timezone: source.timezone,
      password: "",
    };
  });
  const [drawerContent, setDrawerContent] = useState<HTMLDivElement | null>(
    null
  );
  const [inventory, setInventory] = useState<ServerEntry | null>(null);
  const [pending, setPending] = useState(false);
  const [checking, setChecking] = useState(false);
  const checkController = useRef<AbortController | null>(null);
  const [checkResult, setCheckResult] = useState<{
    request: LogSourceRequest;
    success: boolean;
    message: string;
  } | null>(null);
  const busy = pending || checking;
  useEffect(() => () => checkController.current?.abort(), [form]);
  const [error, setError] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ block: "nearest" });
      errorRef.current?.focus({ preventScroll: true });
    }
  }, [error]);
  const update = (key: keyof LogSourceRequest, value: string | number) => {
    const manual = ["host", "username", "domain"].includes(key);
    if (manual) {
      setInventory(null);
    }
    setForm((current) => ({
      ...current,
      [key]: value,
      serverEntryId: manual ? undefined : current.serverEntryId,
    }));
  };
  const changeShare = useCallback((shareName: string) => {
    setForm((current) => ({ ...current, shareName }));
  }, []);
  const detectShare = useCallback((shareName: string) => {
    setForm((current) => ({
      ...current,
      shareName: current.shareName || shareName,
    }));
  }, []);
  const textField = (
    key:
      | "name"
      | "host"
      | "shareName"
      | "basePath"
      | "filenamePattern"
      | "username"
      | "domain"
      | "timezone"
  ) => (
    <Field data-disabled={busy} key={key}>
      <SourceFieldLabel
        field={key}
        htmlFor={`${prefix}-${key}`}
        portalContainer={drawerContent}
      />
      <Input
        autoComplete={key === "username" ? "username" : "off"}
        disabled={busy}
        id={`${prefix}-${key}`}
        maxLength={key === "basePath" ? 2048 : 255}
        onChange={(event) => update(key, event.target.value)}
        placeholder={copy.fieldHelp[key].placeholder}
        required={!["basePath", "domain"].includes(key)}
        value={form[key]}
        variant={
          [
            "host",
            "basePath",
            "filenamePattern",
            "timezone",
            "shareName",
          ].includes(key)
            ? "mono"
            : "default"
        }
      />
      {key === "basePath" && (
        <FieldDescription>{copy.pathHint}</FieldDescription>
      )}
      {key === "filenamePattern" && (
        <FieldDescription>{copy.patternHint}</FieldDescription>
      )}
    </Field>
  );

  const hasSavedPassword =
    !!source?.hasPassword &&
    source.host.toLowerCase() === form.host.trim().toLowerCase() &&
    source.username === form.username.trim() &&
    source.domain === form.domain.trim();
  const passwordPlaceholder = hasSavedPassword
    ? copy.keepPassword
    : copy.fieldHelp.password.placeholder;

  return (
    <Drawer
      direction="right"
      dismissible={!busy}
      onOpenChange={(open) => {
        if (!(open || busy)) {
          onCancel();
        }
      }}
      open
      shouldScaleBackground={false}
    >
      <DrawerContent
        className="overflow-hidden data-[vaul-drawer-direction=right]:w-[calc(100%-1rem)] data-[vaul-drawer-direction=right]:sm:max-w-lg"
        ref={setDrawerContent}
        showSwipeHandle={false}
      >
        <DrawerHeader className="shrink-0" size="lg" variant="left">
          <DrawerTitle>{source ? copy.edit : copy.add}</DrawerTitle>
          <DrawerDescription>{copy.formDescription}</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          data-vaul-no-drag
          onSubmit={async (event) => {
            event.preventDefault();
            setPending(true);
            setError(null);
            try {
              await onSave({ ...form, password: form.password || undefined });
            } catch (cause) {
              setError(getErrorMessage(cause));
            } finally {
              setPending(false);
            }
          }}
        >
          <ScrollArea className="min-h-0 flex-1">
            <div className="flex flex-col gap-6 p-6">
              {error && (
                <Alert ref={errorRef} tabIndex={-1} variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <FieldSet>
                <FieldLegend>{copy.connectionGroup}</FieldLegend>
                <FieldDescription>
                  {copy.connectionDescription}
                </FieldDescription>
                <FieldGroup size="compact">
                  {textField("name")}
                  <FieldGroup
                    className="grid grid-cols-[minmax(0,1fr)_7rem]"
                    size="compact"
                  >
                    <SourceServerPicker
                      disabled={busy}
                      host={form.host}
                      onHostChange={(host) => update("host", host)}
                      onSelect={(server) => {
                        setInventory(server);
                        if (!server) {
                          setForm((current) => ({
                            ...current,
                            serverEntryId: undefined,
                          }));
                          return;
                        }
                        const login = (server.username || "").trim();
                        const separator = login.indexOf("\\");
                        setForm((current) => ({
                          ...current,
                          host: server.host,
                          port:
                            server.accessType.toUpperCase() === "SMB"
                              ? server.port || 445
                              : 445,
                          username:
                            separator < 0 ? login : login.slice(separator + 1),
                          domain:
                            separator < 0 ? "" : login.slice(0, separator),
                          password: "",
                          serverEntryId:
                            server.hasPassword && login ? server.id : undefined,
                        }));
                      }}
                      portalContainer={drawerContent}
                      value={inventory}
                    />

                    <Field data-disabled={busy}>
                      <SourceFieldLabel
                        field="port"
                        htmlFor={`${prefix}-port`}
                        portalContainer={drawerContent}
                      />
                      <Input
                        disabled={busy}
                        id={`${prefix}-port`}
                        inputMode="numeric"
                        maxLength={5}
                        onChange={(event) => {
                          const port = Number(event.target.value);
                          event.target.setCustomValidity(
                            Number.isInteger(port) &&
                              port >= 1 &&
                              port <= 65_535
                              ? ""
                              : copy.fieldHelp.port.description
                          );
                          update("port", port);
                        }}
                        pattern="[0-9]{1,5}"
                        placeholder={copy.fieldHelp.port.placeholder}
                        required
                        type="text"
                        value={form.port}
                        variant="mono"
                      />
                    </Field>
                  </FieldGroup>
                  <SourceSharePicker
                    disabled={busy}
                    onChange={changeShare}
                    onDetected={detectShare}
                    portalContainer={drawerContent}
                    request={form}
                    source={source}
                  />
                </FieldGroup>
              </FieldSet>
              <Separator />
              <FieldSet>
                <FieldLegend>{copy.credentialsGroup}</FieldLegend>
                <FieldDescription>
                  {copy.credentialsDescription}
                </FieldDescription>
                <FieldGroup size="compact">
                  <FieldGroup className="grid sm:grid-cols-2" size="compact">
                    {textField("username")}
                    {textField("domain")}
                  </FieldGroup>
                  <Field data-disabled={busy}>
                    <SourceFieldLabel
                      field="password"
                      htmlFor={`${prefix}-password`}
                      portalContainer={drawerContent}
                    />
                    <Input
                      autoComplete="new-password"
                      disabled={busy}
                      id={`${prefix}-password`}
                      maxLength={4096}
                      onChange={(event) =>
                        update("password", event.target.value)
                      }
                      placeholder={
                        form.serverEntryId
                          ? copy.inventoryPassword
                          : passwordPlaceholder
                      }
                      required={!(hasSavedPassword || form.serverEntryId)}
                      type="password"
                      value={form.password}
                    />
                    {form.serverEntryId && (
                      <FieldDescription>
                        {copy.inventoryPassword}
                      </FieldDescription>
                    )}
                    {!form.serverEntryId && hasSavedPassword && (
                      <FieldDescription>{copy.keepPassword}</FieldDescription>
                    )}
                  </Field>
                </FieldGroup>
              </FieldSet>
              <Separator />
              <FieldSet>
                <FieldLegend>{copy.filesGroup}</FieldLegend>
                <FieldDescription>{copy.filesDescription}</FieldDescription>
                <FieldGroup size="compact">
                  {textField("basePath")}
                  <SourceFolderBrowser
                    disabled={busy}
                    onApply={(layout) => {
                      const parts = layout.basePath.split("/").filter(Boolean);
                      const last = parts.at(-1) ?? "";
                      const suggestedName = ["log", "logs"].includes(
                        last.toLowerCase()
                      )
                        ? parts.at(-2)
                        : last;
                      setForm((current) => ({
                        ...current,
                        name:
                          current.name || suggestedName || current.shareName,
                        basePath: layout.basePath,
                        folderPattern: layout.folderPattern,
                        filenamePattern: layout.filenamePattern,
                      }));
                    }}
                    request={form}
                    source={source}
                  />
                  <Field data-disabled={busy}>
                    <SourceFieldLabel
                      field="folderPattern"
                      htmlFor={`${prefix}-folder`}
                      portalContainer={drawerContent}
                    />
                    <Select
                      disabled={busy}
                      onValueChange={(value) =>
                        update("folderPattern", value === "flat" ? "" : value)
                      }
                      value={form.folderPattern || "flat"}
                    >
                      <SelectTrigger className="w-full" id={`${prefix}-folder`}>
                        <SelectValue
                          placeholder={copy.fieldHelp.folderPattern.placeholder}
                        />
                      </SelectTrigger>
                      <SelectContent portalContainer={drawerContent}>
                        <SelectGroup>
                          <SelectItem value="yyyy/MM">
                            {copy.yearMonth}
                          </SelectItem>
                          <SelectItem value="MM">{copy.month}</SelectItem>
                          <SelectItem value="flat">{copy.flat}</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  {textField("filenamePattern")}
                </FieldGroup>
              </FieldSet>

              <Separator />
              <FieldSet>
                <FieldLegend>{copy.preferencesGroup}</FieldLegend>
                <FieldDescription>
                  {copy.preferencesDescription}
                </FieldDescription>
                <FieldGroup className="grid sm:grid-cols-2" size="compact">
                  <Field data-disabled={busy}>
                    <SourceFieldLabel
                      field="encoding"
                      htmlFor={`${prefix}-encoding`}
                      portalContainer={drawerContent}
                    />
                    <Select
                      disabled={busy}
                      onValueChange={(value) => update("encoding", value)}
                      value={form.encoding}
                    >
                      <SelectTrigger
                        className="w-full"
                        id={`${prefix}-encoding`}
                      >
                        <SelectValue
                          placeholder={copy.fieldHelp.encoding.placeholder}
                        />
                      </SelectTrigger>
                      <SelectContent portalContainer={drawerContent}>
                        <SelectGroup>
                          {["UTF-8", "windows-1252", "ISO-8859-1"].map(
                            (value) => (
                              <SelectItem key={value} value={value}>
                                {value}
                              </SelectItem>
                            )
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </Field>
                  {textField("timezone")}
                </FieldGroup>
              </FieldSet>
            </div>
          </ScrollArea>
          <DrawerFooter className="shrink-0" size="lg" variant="bordered">
            {checkResult?.request === form && (
              <Alert variant={checkResult.success ? "default" : "destructive"}>
                {checkResult.success && <Check />}
                <AlertDescription>{checkResult.message}</AlertDescription>
              </Alert>
            )}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                disabled={busy}
                onClick={async (event) => {
                  if (!event.currentTarget.form?.reportValidity()) {
                    return;
                  }
                  checkController.current?.abort();
                  const controller = new AbortController();
                  checkController.current = controller;
                  const request = form;
                  setChecking(true);
                  setCheckResult(null);
                  try {
                    await browseLogFolder(
                      {
                        sourceId: source?.id,
                        serverEntryId: request.serverEntryId,
                        host: request.host,
                        port: request.port,
                        shareName: request.shareName,
                        username: request.username,
                        domain: request.domain,
                        password: request.password || undefined,
                        path: request.basePath,
                      },
                      controller.signal
                    );
                    if (!controller.signal.aborted) {
                      setCheckResult({
                        request,
                        success: true,
                        message: copy.checkSuccess,
                      });
                    }
                  } catch (cause) {
                    if (!controller.signal.aborted) {
                      setCheckResult({
                        request,
                        success: false,
                        message: getErrorMessage(cause),
                      });
                    }
                  } finally {
                    if (checkController.current === controller) {
                      checkController.current = null;
                      setChecking(false);
                    }
                  }
                }}
                type="button"
                variant="outline"
              >
                {checking ? (
                  <Spinner />
                ) : (
                  <RefreshCw data-icon="inline-start" />
                )}
                {checking ? copy.checking : copy.checkConnection}
              </Button>
              <Button
                disabled={busy}
                onClick={onCancel}
                type="button"
                variant="outline"
              >
                {copy.cancel}
              </Button>
              <Button disabled={busy} type="submit">
                {pending && <Spinner />}
                {pending ? copy.saving : copy.save}
              </Button>
            </div>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
