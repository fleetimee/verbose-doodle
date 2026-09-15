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
import { Textarea } from "@/components/ui/textarea";

type EditJsonFormData = { json: string };

const formatJson = (value: string): string => {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
};

type EditResponseJsonFormProps = {
  defaultValue: string;
  onSubmit: (data: { json: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

import { useI18n } from "@/components/i18n-provider";

export function EditResponseJsonForm({
  defaultValue,
  isLoading = false,
  onCancel,
  onSubmit,
}: EditResponseJsonFormProps) {
  const { messages } = useI18n();
  const editJsonSchema = z.object({
    json: z
      .string()
      .min(1, messages.endpoints.jsonRequiredError)
      .refine(
        (val) => {
          try {
            JSON.parse(val);
            return true;
          } catch {
            return false;
          }
        },
        { message: messages.endpoints.invalidJsonError }
      ),
  });
  const form = useForm<EditJsonFormData>({
    defaultValues: {
      json: formatJson(defaultValue),
    },
    resolver: zodResolver(editJsonSchema),
  });

  return (
    <Form {...form}>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <FieldGroup className="space-y-4">
          <Controller
            control={form.control}
            name="json"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="edit-response-json">
                  {messages.endpoints.jsonResponseLabel}
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoFocus
                    className="font-mono text-sm"
                    id="edit-response-json"
                    placeholder={messages.endpoints.jsonResponsePlaceholder}
                    rows={10}
                  />
                  <FieldDescription>
                    {messages.endpoints.jsonResponseDescription}
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
