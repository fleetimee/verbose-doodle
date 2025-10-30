import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { type LoginFormData, loginSchema } from "../types";

type LoginFormProps = {
  onSubmit: (data: LoginFormData) => void;
  isLoading?: boolean;
};

export const LoginForm = ({ onSubmit, isLoading = false }: LoginFormProps) => {
  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
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
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          id="login-form"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FieldGroup>
            <Controller
              control={form.control}
              name="email"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="login-form-email">Email</FieldLabel>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="email"
                    id="login-form-email"
                    placeholder="name@example.com"
                    type="email"
                  />
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
                  <div className="flex items-center justify-between">
                    <FieldLabel htmlFor="login-form-password">
                      Password
                    </FieldLabel>
                    <button
                      className="text-muted-foreground text-sm transition-colors hover:text-primary"
                      type="button"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    {...field}
                    aria-invalid={fieldState.invalid}
                    autoComplete="current-password"
                    id="login-form-password"
                    placeholder="Enter your password"
                    type="password"
                  />
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
                  <FieldLabel
                    className="cursor-pointer font-normal"
                    htmlFor="login-form-remember"
                  >
                    Remember me for 30 days
                  </FieldLabel>
                  <FieldDescription className="sr-only">
                    Stay signed in for 30 days
                  </FieldDescription>
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

      <CardFooter className="flex justify-center border-border/40 border-t pt-6">
        <p className="text-muted-foreground text-sm">
          Don't have an account?{" "}
          <button
            className="font-medium text-primary hover:underline"
            type="button"
          >
            Sign up
          </button>
        </p>
      </CardFooter>
    </Card>
  );
};
