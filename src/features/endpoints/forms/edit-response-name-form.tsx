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

const editNameSchema = z.object({
  name: z.string().min(1, "Name is required"),
});

type EditNameFormData = z.infer<typeof editNameSchema>;

type EditResponseNameFormProps = {
  defaultValue: string;
  onSubmit: (data: { name: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function EditResponseNameForm({
  defaultValue,
  onSubmit,
  onCancel,
  isLoading,
}: EditResponseNameFormProps) {
  const form = useForm<EditNameFormData>({
    resolver: zodResolver(editNameSchema),
    defaultValues: {
      name: defaultValue,
    },
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
                  Response Name
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="off"
                    autoFocus
                    id="edit-response-name"
                    placeholder="e.g., success_response, error_response"
                  />
                  <FieldDescription>
                    A descriptive name for this response
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
