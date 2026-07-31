import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/context";
import type { LoginFormData } from "@/features/login/schemas/login-schema";
import type {
  ApiLoginResponse,
  LoginError,
  LoginResponse,
} from "@/features/login/types";
import { apiFetch } from "@/lib/api";
import { getLoginUrl } from "@/lib/api-endpoints";
import { handleAuthError, showSuccessToast } from "@/lib/error-handler";
import { formatMessage, messages } from "@/lib/i18n";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Login mutation function
 * Makes API call to authenticate user
 */
async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  try {
    const apiResponse = await apiFetch<ApiLoginResponse>(getLoginUrl(), {
      body: JSON.stringify({
        password: data.password,
        username: data.username,
      }),
      method: "POST",
    });

    // Check if login was successful
    if (apiResponse.responseCode !== "00") {
      // Throw error with the API's response description
      throw {
        code: apiResponse.responseCode,
        message: apiResponse.responseDesc || messages.auth.loginFailed,
        status: 401,
      } as LoginError;
    }

    return {
      accessToken: apiResponse.data.accessToken,
      refreshToken: apiResponse.data.refreshToken,
      responseCode: apiResponse.responseCode,
      responseDesc: apiResponse.responseDesc,
    };
  } catch (error) {
    throw error as LoginError;
  }
}

type UseLoginOptions = {
  navigateOnSuccess?: boolean;
  onSuccess?: (data: LoginResponse, variables: LoginFormData) => void;
  showToast?: boolean;
};

/**
 * Custom hook for handling user login
 * Uses TanStack Query mutation for state management
 * Integrates with AuthContext for session management
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
export function useLogin({
  navigateOnSuccess = true,
  onSuccess,
  showToast = true,
}: UseLoginOptions = {}) {
  const navigate = useNavigate();
  const { login: signIn } = useAuth();

  const mutation = createMutationHook<LoginResponse, LoginFormData, LoginError>(
    loginUser,
    {
      onError: (error) => {
        // Handle authentication errors with toast notifications
        handleAuthError(error);
      },
      onSuccess: (data, variables) => {
        // Check if login was successful based on responseCode
        if (data.responseCode === "00") {
          signIn({
            accessToken: data.accessToken,
            refreshToken: data.refreshToken,
          });

          // Show success message
          if (showToast) {
            showSuccessToast(
              messages.auth.loginSuccessTitle,
              formatMessage(messages.auth.loginSuccessDescription, {
                username: variables.username,
              })
            );
          }

          onSuccess?.(data, variables);

          // Redirect to home page
          if (navigateOnSuccess) {
            navigate("/dashboard/overview");
          }
        }
        // Note: If responseCode is not "00", the mutation should throw an error
        // This is handled in the loginUser function
      },
    }
  );

  return mutation();
}
