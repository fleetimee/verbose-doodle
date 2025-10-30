import { useState } from "react";
import { useNavigate } from "react-router";
import { LoginForm } from "@/features/login/components/login-form";
import type { LoginFormData } from "@/features/login/types";

/**
 * Simulated API delay for demonstration purposes
 */
const SIMULATED_API_DELAY_MS = 1500;

const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (_data: LoginFormData) => {
    setIsLoading(true);

    try {
      // Simulate API call
      await new Promise((resolve) =>
        setTimeout(resolve, SIMULATED_API_DELAY_MS)
      );

      // TODO: Replace with actual authentication logic

      // On successful login, redirect to home
      navigate("/");
    } catch {
      // TODO: Implement proper error handling with toast notifications
    } finally {
      setIsLoading(false);
    }
  };

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
        <LoginForm isLoading={isLoading} onSubmit={handleLogin} />

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

export default LoginPage;
