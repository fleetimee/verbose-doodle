import { useNavigate } from "react-router";
import { useAuth } from "@/features/auth/context";
import type { LoginFormData } from "@/features/login/schemas/login-schema";
import type { LoginError, LoginResponse } from "@/features/login/types";
import { handleAuthError, showSuccessToast } from "@/lib/error-handler";
import { createMutationHook } from "@/lib/query-hooks";

/**
 * Simulated API delay for demonstration purposes
 */
const SIMULATED_API_DELAY_MS = 1500;

/**
 * Mock user credentials for testing
 * TODO: Remove when backend is ready
 */
const MOCK_USER = {
  user_id: "1",
  username: "admin",
  password: "password123",
  role: "ADMIN" as const,
};

/**
 * Generate a mock JWT token for testing
 * Format: header.payload.signature (all base64url encoded)
 */
function generateMockJWT(
  user_id: string,
  username: string,
  role: string
): string {
  const header = { alg: "HS256", typ: "JWT" };
  const payload = { user_id, username, role };

  // Base64url encode
  const encodeBase64Url = (obj: object) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=/g, "");

  const encodedHeader = encodeBase64Url(header);
  const encodedPayload = encodeBase64Url(payload);
  const mockSignature = "mock_signature_for_testing";

  return `${encodedHeader}.${encodedPayload}.${mockSignature}`;
}

/**
 * Login mutation function
 * TODO: Replace with actual API call when backend is ready
 */
async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  // Simulate API call delay
  await new Promise((resolve) => setTimeout(resolve, SIMULATED_API_DELAY_MS));

  // Check credentials against mock user
  if (
    data.username === MOCK_USER.username &&
    data.password === MOCK_USER.password
  ) {
    const token = generateMockJWT(
      MOCK_USER.user_id,
      MOCK_USER.username,
      MOCK_USER.role
    );

    return {
      response_code: "00",
      response_desc: "success",
      token,
      role: MOCK_USER.role,
    };
  }

  // Invalid credentials
  throw {
    message: "Invalid username or password",
    code: "AUTH_FAILED",
    status: 401,
  } as LoginError;

  // Uncomment when backend is ready:
  // return apiPost<LoginResponse>("/login", {
  //   username: data.username,
  //   password: data.password,
  // });
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
        // Check if login was successful based on response_code
        if (data.response_code === "00") {
          // Save JWT token and decode to extract user data
          setAuthUser(data.token);

          // Show success message
          showSuccessToast(
            "Welcome back!",
            `Signed in as ${variables.username}`
          );

          // Redirect to home page
          navigate("/");
        } else {
          // Handle unsuccessful login
          handleAuthError({
            message: data.response_desc || "Login failed",
            code: data.response_code,
          });
        }
      },
      onError: (error) => {
        // Handle authentication errors with toast notifications
        handleAuthError(error);
      },
    }
  );

  return mutation();
}
