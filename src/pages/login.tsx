import { LoginForm } from "@/features/login/components/login-form";
import { useLogin } from "@/features/login/hooks/use-login";
import { useDocumentMeta } from "@/hooks/use-document-meta";
import { getErrorMessage } from "@/lib/error-handler";

export const Login = () => {
  useDocumentMeta({
    title: "Login",
    description: "Sign in to your billing simulator account",
    keywords: ["login", "sign in", "authentication"],
  });

  const { mutate: login, isPending, error, isError } = useLogin();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        {/* Logo or Brand */}
        <div className="mb-8 text-center">
          <h1 className="mb-2 font-bold text-3xl tracking-tight">
            Biller Simulator
          </h1>
          <p className="text-muted-foreground text-sm">
            Prototype billing scenarios with ease
          </p>
        </div>

        {/* Login Form */}
        <LoginForm
          error={
            isError
              ? {
                  message: "Login Failed",
                  description: getErrorMessage(error),
                }
              : null
          }
          isLoading={isPending}
          onSubmit={login}
        />

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-muted-foreground text-xs">
            By signing in, you agree to our{" "}
            <button className="text-primary hover:underline" type="button">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-primary hover:underline" type="button">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};
