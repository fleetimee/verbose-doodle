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

const editJsonSchema = z.object({
  json: z
    .string()
    .min(1, "JSON is required")
    .refine(
      (val) => {
        try {
          JSON.parse(val);
          return true;
        } catch {
          return false;
        }
      },
      { message: "Must be valid JSON" }
    ),
});

type EditJsonFormData = z.infer<typeof editJsonSchema>;

type EditResponseJsonFormProps = {
  defaultValue: string;
  onSubmit: (data: { json: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function EditResponseJsonForm({
  defaultValue,
  onSubmit,
  onCancel,
  isLoading,
}: EditResponseJsonFormProps) {
  const form = useForm<EditJsonFormData>({
    resolver: zodResolver(editJsonSchema),
    defaultValues: {
      json: defaultValue,
    },
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
                  JSON Response
                </FieldLabel>
                <FieldContent>
                  <Textarea
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoFocus
                    className="font-mono text-sm"
                    id="edit-response-json"
                    placeholder='{"key": "value"}'
                    rows={10}
                  />
                  <FieldDescription>
                    The JSON response body (must be valid JSON)
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
            Cancel
          </Button>
          <Button disabled={isLoading} type="submit">
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
