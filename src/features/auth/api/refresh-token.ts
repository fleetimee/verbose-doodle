/**
 * @deprecated This file is deprecated. Use @/features/auth/hooks/use-refresh-token instead.
 * This file is kept for backward compatibility only.
 */

// biome-ignore lint/performance/noBarrelFile: Legacy re-export for backward compatibility
export {
  type RefreshTokenError,
  type RefreshTokenResult,
  refreshToken,
} from "@/features/auth/hooks/use-refresh-token";
