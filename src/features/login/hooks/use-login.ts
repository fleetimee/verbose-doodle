import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "react-router";
import { handleAuthError, showSuccessToast } from "@/lib/error-handler";
import type { LoginFormData } from "../schemas/login-schema";
import type { LoginError, LoginResponse } from "../types";

/**
 * Simulated API delay for demonstration purposes
 */
const SIMULATED_API_DELAY_MS = 1500;

/**
 * Login API call
 * TODO: Replace with actual API endpoint when backend is ready
 */
async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  // TODO: Replace with actual API call
  // return apiPost<LoginResponse, LoginFormData>('/auth/login', data);

  // Simulated success response
  return {
    success: true,
    token: "simulated-jwt-token",
    user: {
      id: "1",
      email: data.email,
      name: "Demo User",
    },
    message: "Login successful",
  };
}

/**
 * Custom hook for handling user login
 * Uses TanStack Query mutation for state management
 *
 * @example
 * ```tsx
 * const { mutate: login, isPending } = useLogin();
 *
 * const handleSubmit = (data: LoginFormData) => {
 *   login(data);
 * };
 * ```
 */
export function useLogin() {
  const navigate = useNavigate();

  return useMutation<LoginResponse, LoginError, LoginFormData>({
    mutationFn: loginUser,
    onSuccess: (data) => {
      // Store auth token (TODO: use proper auth context/store)
      if (data.token) {
        localStorage.setItem("auth_token", data.token);
      }

      // Store user data (TODO: use proper auth context/store)
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      // Show success message
      showSuccessToast(
        "Welcome back!",
        `Signed in as ${data.user?.email || "user"}`
      );

      // Redirect to home page
      navigate("/");
    },
    onError: (error) => {
      // Handle authentication errors with toast notifications
      handleAuthError(error);
    },
  });
}
