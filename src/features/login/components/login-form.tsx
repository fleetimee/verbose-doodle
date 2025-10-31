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
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { SliderCaptcha } from "@/components/ui/slider-captcha";
import { Spinner } from "@/components/ui/spinner";
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
      captchaVerified: false,
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
          </FieldGroup>

          <Controller
            control={form.control}
            name="captchaVerified"
            render={({ field, fieldState }) => (
              <div>
                <SliderCaptcha
                  className={
                    fieldState.invalid ? "ring-2 ring-destructive" : ""
                  }
                  onVerify={(verified) => field.onChange(verified)}
                />
                {fieldState.invalid && (
                  <p className="mt-2 text-destructive text-sm">
                    {fieldState.error?.message}
                  </p>
                )}
              </div>
            )}
          />

          <Button
            className="w-full"
            disabled={isLoading}
            form="login-form"
            type="submit"
          >
            {isLoading && <Spinner className="mr-2" />}
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
