import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { ChevronDown, Eye } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { AccessTypePicker } from "@/features/server-inventory/components/access-type-picker";
import { DatabaseEnginePicker } from "@/features/server-inventory/components/database-engine-picker";
import { serverAccessTypes } from "@/features/server-inventory/components/server-access-icon";
import { ServerHostPicker } from "@/features/server-inventory/components/server-host-picker";
import {
  buildServerEntryRequest,
  createServerFormSchema,
  type ServerFormValues,
  serverFormDefaults,
} from "@/features/server-inventory/server-form";
import type {
  ServerEntry,
  ServerEntryRequest,
} from "@/features/server-inventory/types";
import { getErrorMessage } from "@/lib/error-handler";

const defaultPorts: Record<string, string> = {
  SSH: "22",
  RDP: "3389",
  FTP: "21",
  FTPS: "990",
  SFTP: "22",
  HTTP: "80",
  HTTPS: "443",
  VNC: "5900",
  TELNET: "23",
  WINRM: "5985",
  SMB: "445",
};

export function ServerEntryDrawer({
  entry,
  types,
  hosts,
  saving,
  onSave,
  onClose,
}: {
  entry?: ServerEntry;
  types: string[];
  hosts: string[];
  saving: boolean;
  onSave: (request: ServerEntryRequest, id?: string) => Promise<unknown>;
  onClose: () => void;
}) {
  const { messages } = useI18n();
  const copy = messages.servers;
  const [drawerContent, setDrawerContent] = useState<HTMLDivElement | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<ServerFormValues>({
    defaultValues: {
      ...serverFormDefaults(entry),
      ...(!entry && { port: "22" }),
    },
    resolver: zodResolver(createServerFormSchema(copy)),
  });
  const [optionalOpen, setOptionalOpen] = useState(
    Boolean(
      entry &&
        (entry.port ||
          entry.username ||
          entry.url ||
          entry.databaseEngine ||
          entry.databaseName ||
          entry.hasPassword ||
          entry.notes)
    )
  );
  const clearPassword = form.watch("clearPassword");
  const accessType = form.watch("accessType").toUpperCase();
  const values = form.watch();
  const contextualFields = (
    {
      SSH: ["port"],
      DATABASE: ["port", "databaseEngine", "databaseName"],
      WEB: ["port", "url"],
      HTTP: ["port", "url"],
      HTTPS: ["port", "url"],
    } as Record<string, string[]>
  )[accessType] ?? ["port"];
  const knownType = serverAccessTypes.includes(accessType);
  const fields = [
    { name: "name", label: copy.name, placeholder: copy.namePlaceholder },
    { name: "host", label: copy.host, placeholder: copy.hostPlaceholder },
    { name: "port", label: copy.port, placeholder: copy.portPlaceholder },
    {
      name: "username",
      label: copy.username,
      placeholder: copy.usernamePlaceholder,
    },
    { name: "url", label: copy.url, placeholder: copy.urlPlaceholder },
    {
      name: "databaseEngine",
      label: copy.databaseEngine,
      placeholder: copy.enginePlaceholder,
    },
    {
      name: "databaseName",
      label: copy.databaseName,
      placeholder: copy.databasePlaceholder,
    },
  ] as const;

  const submit = async (values: ServerFormValues) => {
    setError(null);
    try {
      await onSave(buildServerEntryRequest(values), entry?.id);
      toast.success(entry ? copy.updateSuccess : copy.createSuccess);
      form.reset(serverFormDefaults());
      onClose();
    } catch (cause) {
      setError(getErrorMessage(cause));
    }
  };

  return (
    <Drawer
      direction="right"
      dismissible={!saving}
      onOpenChange={(open) => {
        if (!(open || saving)) {
          onClose();
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
          <DrawerTitle>{entry ? copy.editTitle : copy.addTitle}</DrawerTitle>
          <DrawerDescription>{copy.formDescription}</DrawerDescription>
        </DrawerHeader>
        <form
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
          data-vaul-no-drag
          onSubmit={form.handleSubmit(submit, (errors) => {
            if (
              Object.keys(errors).some(
                (name) => !["name", "host", "accessType"].includes(name)
              )
            ) {
              setOptionalOpen(true);
            }
          })}
        >
          <div className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto px-6 py-6">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <FieldGroup className="grid grid-cols-1" size="compact">
              <Field
                data-disabled={saving}
                data-invalid={!!form.formState.errors.name}
              >
                <FieldLabel htmlFor="server-name">{copy.name}</FieldLabel>
                <Input
                  {...form.register("name")}
                  aria-invalid={!!form.formState.errors.name}
                  autoComplete="off"
                  disabled={saving}
                  id="server-name"
                  placeholder={copy.namePlaceholder}
                />
                <FieldError errors={[form.formState.errors.name]} />
              </Field>
              <Controller
                control={form.control}
                name="host"
                render={({ field, fieldState }) => (
                  <Field
                    data-disabled={saving}
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="server-host">{copy.host}</FieldLabel>
                    <ServerHostPicker
                      disabled={saving}
                      hosts={hosts}
                      inputRef={field.ref}
                      invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      portalContainer={drawerContent}
                      value={field.value}
                    />
                    <FieldDescription id="server-host-description">
                      {copy.hostDescription}
                    </FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                control={form.control}
                name="accessType"
                render={({ field, fieldState }) => (
                  <Field
                    data-disabled={saving}
                    data-invalid={fieldState.invalid}
                  >
                    <FieldLabel htmlFor="server-access-type">
                      {copy.accessType}
                    </FieldLabel>
                    <AccessTypePicker
                      disabled={saving}
                      id="server-access-type"
                      invalid={fieldState.invalid}
                      onChange={(type) => {
                        field.onChange(type);
                        const portWasEdited =
                          form.getFieldState("port").isDirty;
                        const canUpdateDefault = !(entry || portWasEdited);
                        if (canUpdateDefault || !form.getValues("port")) {
                          form.setValue("port", defaultPorts[type] ?? "");
                        }
                      }}
                      portalContainer={drawerContent}
                      types={types}
                      value={field.value}
                    />
                    <FieldDescription>{copy.typeDescription}</FieldDescription>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              {fields
                .filter(({ name }) => contextualFields.includes(name))
                .map(({ name, label, placeholder }) => (
                  <Field
                    data-disabled={saving}
                    data-invalid={!!form.formState.errors[name]}
                    key={name}
                  >
                    <FieldLabel htmlFor={`server-${name}`}>{label}</FieldLabel>
                    {name === "databaseEngine" ? (
                      <Controller
                        control={form.control}
                        name="databaseEngine"
                        render={({ field, fieldState }) => (
                          <DatabaseEnginePicker
                            disabled={saving}
                            id="server-databaseEngine"
                            invalid={fieldState.invalid}
                            onChange={field.onChange}
                            portalContainer={drawerContent}
                            value={field.value}
                          />
                        )}
                      />
                    ) : (
                      <Input
                        {...form.register(name)}
                        aria-invalid={!!form.formState.errors[name]}
                        autoComplete="off"
                        disabled={saving}
                        id={`server-${name}`}
                        inputMode={name === "port" ? "numeric" : undefined}
                        placeholder={
                          name === "port" && defaultPorts[accessType]
                            ? defaultPorts[accessType]
                            : placeholder
                        }
                      />
                    )}
                    <FieldError errors={[form.formState.errors[name]]} />
                  </Field>
                ))}
            </FieldGroup>
            <Collapsible onOpenChange={setOptionalOpen} open={optionalOpen}>
              <CollapsibleTrigger type="button" variant="header">
                {copy.optionalFields}
                <ChevronDown
                  className={optionalOpen ? "size-4 rotate-180" : "size-4"}
                />
              </CollapsibleTrigger>
              <CollapsibleContent keepMounted>
                <FieldGroup className="pt-5" size="compact">
                  {fields
                    .filter(({ name }) => {
                      if (
                        name === "name" ||
                        name === "host" ||
                        contextualFields.includes(name)
                      ) {
                        return false;
                      }
                      return (
                        name === "port" ||
                        name === "username" ||
                        !knownType ||
                        Boolean(values[name])
                      );
                    })
                    .map(({ name, label, placeholder }) => (
                      <Field
                        data-disabled={saving}
                        data-invalid={!!form.formState.errors[name]}
                        key={name}
                      >
                        <FieldLabel htmlFor={`server-${name}`}>
                          {label}
                        </FieldLabel>
                        {name === "databaseEngine" ? (
                          <Controller
                            control={form.control}
                            name="databaseEngine"
                            render={({ field, fieldState }) => (
                              <DatabaseEnginePicker
                                disabled={saving}
                                id="server-databaseEngine"
                                invalid={fieldState.invalid}
                                onChange={field.onChange}
                                portalContainer={drawerContent}
                                value={field.value}
                              />
                            )}
                          />
                        ) : (
                          <Input
                            {...form.register(name)}
                            aria-invalid={!!form.formState.errors[name]}
                            autoComplete="off"
                            disabled={saving}
                            id={`server-${name}`}
                            inputMode={name === "port" ? "numeric" : undefined}
                            placeholder={placeholder}
                          />
                        )}
                        <FieldError errors={[form.formState.errors[name]]} />
                      </Field>
                    ))}
                  <Field
                    data-disabled={saving || clearPassword}
                    data-invalid={!!form.formState.errors.password}
                  >
                    <FieldLabel htmlFor="server-password">
                      {copy.password}
                    </FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        {...form.register("password")}
                        aria-invalid={!!form.formState.errors.password}
                        autoComplete="new-password"
                        disabled={saving || clearPassword}
                        id="server-password"
                        placeholder={
                          entry
                            ? copy.keepPasswordPlaceholder
                            : copy.passwordPlaceholder
                        }
                        type={showPassword ? "text" : "password"}
                      />
                      <InputGroupAddon align="inline-end">
                        <InputGroupButton
                          aria-label={
                            showPassword ? copy.hidePassword : copy.showPassword
                          }
                          disabled={saving || clearPassword}
                          onClick={() => setShowPassword(!showPassword)}
                          size="icon-xs"
                          type="button"
                        >
                          <Eye />
                        </InputGroupButton>
                      </InputGroupAddon>
                    </InputGroup>
                    <FieldDescription>
                      {entry
                        ? copy.keepPasswordDescription
                        : copy.passwordDescription}
                    </FieldDescription>
                    <FieldError errors={[form.formState.errors.password]} />
                  </Field>
                  {entry?.hasPassword && (
                    <Controller
                      control={form.control}
                      name="clearPassword"
                      render={({ field }) => (
                        <Field orientation="horizontal">
                          <Checkbox
                            checked={field.value}
                            disabled={saving}
                            id="server-clear-password"
                            onCheckedChange={(checked) =>
                              field.onChange(checked === true)
                            }
                          />
                          <FieldLabel htmlFor="server-clear-password">
                            {copy.removePassword}
                          </FieldLabel>
                        </Field>
                      )}
                    />
                  )}
                  <Field
                    data-disabled={saving}
                    data-invalid={!!form.formState.errors.notes}
                  >
                    <FieldLabel htmlFor="server-notes">{copy.notes}</FieldLabel>
                    <Textarea
                      {...form.register("notes")}
                      aria-invalid={!!form.formState.errors.notes}
                      disabled={saving}
                      id="server-notes"
                      placeholder={copy.notesPlaceholder}
                      rows={3}
                    />
                    <FieldError errors={[form.formState.errors.notes]} />
                  </Field>
                </FieldGroup>
              </CollapsibleContent>
            </Collapsible>
          </div>
          <DrawerFooter className="shrink-0" size="lg" variant="bordered">
            <Button disabled={saving} type="submit">
              {saving && <Spinner data-icon="inline-start" />}
              {saving ? messages.common.saving : copy.save}
            </Button>
            <Button
              disabled={saving}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              {messages.common.cancel}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
