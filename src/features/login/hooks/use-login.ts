import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/context";
import type { LoginFormData } from "@/features/login/schemas/login-schema";
import type {
  ApiLoginResponse,
  LoginError,
  LoginResponse,
  UserRole,
} from "@/features/login/types";
import { apiFetch } from "@/lib/api";
import { getLoginUrl } from "@/lib/api-endpoints";
import { handleAuthError, showSuccessToast } from "@/lib/error-handler";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Number of parts in a valid JWT token (header.payload.signature)
 */
const JWT_PARTS_COUNT = 3;

/**
 * Decode JWT token to extract user role
 * @param token - JWT token string
 * @returns User role extracted from token payload
 */
function decodeJWTRole(token: string): UserRole {
  try {
    // JWT format: header.payload.signature
    const parts = token.split(".");
    if (parts.length !== JWT_PARTS_COUNT) {
      throw new Error("Invalid JWT format");
    }

    // Decode the payload (second part)
    const payload = parts[1];
    const decodedPayload = JSON.parse(
      atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
    );

    // Extract role from payload
    const role = decodedPayload.role as UserRole;
    if (!role || (role !== "ADMIN" && role !== "USER")) {
      throw new Error("Invalid role in JWT token");
    }

    return role;
  } catch {
    // Default to USER role if decoding fails
    return "USER";
  }
}

/**
 * Login mutation function
 * Makes API call to authenticate user
 */
async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  try {
    const apiResponse = await apiFetch<ApiLoginResponse>(getLoginUrl(), {
      method: "POST",
      body: JSON.stringify({
        username: data.username,
        password: data.password,
      }),
    });

    // Check if login was successful
    if (apiResponse.responseCode !== "00") {
      // Throw error with the API's response description
      throw {
        message: apiResponse.responseDesc || "Login failed",
        code: apiResponse.responseCode,
        status: 401,
      } as LoginError;
    }

    // Extract role from JWT access token
    const role = decodeJWTRole(apiResponse.data.accessToken);

    return {
      responseCode: apiResponse.responseCode,
      responseDesc: apiResponse.responseDesc,
      accessToken: apiResponse.data.accessToken,
      refreshToken: apiResponse.data.refreshToken,
      role,
    };
  } catch (error) {
    throw error as LoginError;
  }
}

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
export function useLogin() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const mutation = createMutationHook<LoginResponse, LoginFormData, LoginError>(
    loginUser,
    {
      onSuccess: (data, variables) => {
        // Check if login was successful based on responseCode
        if (data.responseCode === "00") {
          // Save both access and refresh tokens
          setAuthUser(data.accessToken, data.refreshToken);

          // Show success message
          showSuccessToast(
            "Welcome back!",
            `Signed in as ${variables.username}`
          );

          // Redirect to home page
          navigate("/");
        }
        // Note: If responseCode is not "00", the mutation should throw an error
        // This is handled in the loginUser function
      },
      onError: (error) => {
        // Handle authentication errors with toast notifications
        handleAuthError(error);
      },
    }
  );

  return mutation();
}
