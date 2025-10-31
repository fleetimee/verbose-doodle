import { zodResolver } from "@hookform/resolvers/zod";
import { OctagonXIcon } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  type LoginFormData,
  loginSchema,
} from "@/features/login/schemas/login-schema";

type LoginFormProps = {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
  error?: {
    message: string;
    description?: string;
  } | null;
};

export const LoginForm = ({
  onSubmit,
  isLoading = false,
  error = null,
}: LoginFormProps) => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  return (
    <Card className="w-full max-w-md border-border/40 shadow-xl">
      <CardHeader className="space-y-1">
        <CardTitle className="font-bold text-2xl tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your username and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          id="login-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          {error && (
            <Alert variant="destructive">
              <OctagonXIcon />
              <AlertTitle>{error.message}</AlertTitle>
              {error.description && (
                <AlertDescription>{error.description}</AlertDescription>
              )}
            </Alert>
          )}

          <FieldGroup>
            <Controller
              control={form.control}
              name="username"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-form-username">
                    Username
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="username"
                      id="login-form-username"
                      placeholder="Enter your username"
                      type="text"
                    />
                    <FieldDescription>
                      Your unique username for the biller simulator.
                    </FieldDescription>
                  </FieldContent>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-form-password">
                    Password
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      {...field}
                      aria-invalid={fieldState.invalid}
                      autoComplete="current-password"
                      id="login-form-password"
                      placeholder="Enter your password"
                      type="password"
                    />
                    <FieldDescription>
                      Use at least 8 characters with letters and numbers.
                    </FieldDescription>
                  </FieldContent>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              control={form.control}
              name="rememberMe"
              render={({ field, fieldState }) => (
                <Field
                  data-invalid={fieldState.invalid}
                  orientation="horizontal"
                >
                  <Checkbox
                    aria-invalid={fieldState.invalid}
                    checked={field.value}
                    id="login-form-remember"
                    name={field.name}
                    onCheckedChange={field.onChange}
                  />
                  <FieldContent>
                    <FieldLabel
                      className="cursor-pointer font-normal"
                      htmlFor="login-form-remember"
                    >
                      Remember me for 30 days
                    </FieldLabel>
                    <FieldDescription className="sr-only">
                      Stay signed in for 30 days
                    </FieldDescription>
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <Button
            className="w-full"
            disabled={isLoading}
            form="login-form"
            type="submit"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
