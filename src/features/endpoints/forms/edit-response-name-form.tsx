import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type EditNameFormData = { name: string };

type EditResponseNameFormProps = {
  defaultValue: string;
  onSubmit: (data: { name: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

import { useI18n } from "@/components/i18n-provider";

export function EditResponseNameForm({
  defaultValue,
  isLoading = false,
  onCancel,
  onSubmit,
}: EditResponseNameFormProps) {
  const { messages } = useI18n();
  const editNameSchema = z.object({
    name: z.string().min(1, messages.endpoints.nameRequiredError),
  });
  const form = useForm<EditNameFormData>({
    defaultValues: {
      name: defaultValue,
    },
    resolver: zodResolver(editNameSchema),
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-4">
          <Controller
            control={form.control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-response-name">
                  {messages.endpoints.responseNameLabel}
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    autoFocus
                    id="edit-response-name"
                    placeholder={messages.endpoints.responseNamePlaceholder}
                  />
                  <FieldDescription>
                    {messages.endpoints.responseNameDescription}
                  </FieldDescription>
                </FieldContent>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>

        <div className="flex justify-end gap-2">
          <Button
            disabled={isLoading}
            onClick={onCancel}
            type="button"
            variant="outline"
          >
            {messages.common.cancel}
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? messages.common.saving : messages.common.save}
          </Button>
        </div>
      </form>
    </Form>
  );
}
