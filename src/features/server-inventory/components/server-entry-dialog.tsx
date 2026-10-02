import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye } from "@/components/hugeicons";
import { useI18n } from "@/components/i18n-provider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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

export function ServerEntryDialog({
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
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<ServerFormValues>({
    defaultValues: serverFormDefaults(entry),
    resolver: zodResolver(createServerFormSchema(copy)),
  });
  const clearPassword = form.watch("clearPassword");
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
    <Dialog
      onOpenChange={(open) => {
        if (!(open || saving)) {
          onClose();
        }
      }}
      open
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto" size="xl">
        <DialogHeader>
          <DialogTitle>{entry ? copy.editTitle : copy.addTitle}</DialogTitle>
          <DialogDescription>{copy.formDescription}</DialogDescription>
        </DialogHeader>
        <form
          className="flex flex-col gap-5"
          onSubmit={form.handleSubmit(submit)}
        >
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <FieldGroup
            className="grid grid-cols-1 sm:grid-cols-2"
            size="compact"
          >
            {fields.map(({ name, label, placeholder }) => (
              <Field
                data-disabled={saving}
                data-invalid={!!form.formState.errors[name]}
                key={name}
              >
                <FieldLabel htmlFor={`server-${name}`}>{label}</FieldLabel>
                <Input
                  {...form.register(name)}
                  aria-describedby={
                    name === "host" ? "server-host-description" : undefined
                  }
                  aria-invalid={!!form.formState.errors[name]}
                  autoComplete="off"
                  disabled={saving}
                  id={`server-${name}`}
                  inputMode={name === "port" ? "numeric" : undefined}
                  list={name === "host" ? "server-host-suggestions" : undefined}
                  placeholder={placeholder}
                />
                {name === "host" && (
                  <>
                    <datalist id="server-host-suggestions">
                      {hosts.map((host) => (
                        <option key={host} value={host} />
                      ))}
                    </datalist>
                    <FieldDescription id="server-host-description">
                      {copy.hostDescription}
                    </FieldDescription>
                  </>
                )}
                <FieldError errors={[form.formState.errors[name]]} />
              </Field>
            ))}
            <Controller
              control={form.control}
              name="accessType"
              render={({ field, fieldState }) => (
                <Field data-disabled={saving} data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="server-access-type">
                    {copy.accessType}
                  </FieldLabel>
                  <AccessTypePicker
                    disabled={saving}
                    id="server-access-type"
                    invalid={fieldState.invalid}
                    onChange={field.onChange}
                    types={types}
                    value={field.value}
                  />
                  <FieldDescription>{copy.typeDescription}</FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </FieldGroup>
          <FieldGroup size="compact">
            <Field
              data-disabled={saving || clearPassword}
              data-invalid={!!form.formState.errors.password}
            >
              <FieldLabel htmlFor="server-password">{copy.password}</FieldLabel>
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
          <DialogFooter>
            <Button
              disabled={saving}
              onClick={onClose}
              type="button"
              variant="outline"
            >
              {messages.common.cancel}
            </Button>
            <Button disabled={saving} type="submit">
              {saving && <Spinner data-icon="inline-start" />}
              {saving ? messages.common.saving : copy.save}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
