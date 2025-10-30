/**
 * Custom query hook utilities and types
 * These provide type-safe wrappers around TanStack Query hooks
 */

import {
  type QueryKey,
  type UseMutationOptions,
  type UseMutationResult,
  type UseQueryOptions,
  type UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import type { ApiError } from "./api";

/**
 * Type-safe query options
 */
export type QueryOptions<TData, TError = ApiError> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
>;

/**
 * Type-safe mutation options
 */
export type MutationOptions<
  TData,
  TVariables = void,
  TError = ApiError,
> = UseMutationOptions<TData, TError, TVariables>;

/**
 * Creates a type-safe query hook
 * @example
 * ```ts
 * const useGetUser = createQueryHook({
 *   queryKey: ['user', userId],
 *   queryFn: () => apiGet<User>(`/users/${userId}`),
 * });
 * ```
 */
export function createQueryHook<TData, TError = ApiError>(config: {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  options?: QueryOptions<TData, TError>;
}) {
  return (): UseQueryResult<TData, TError> =>
    useQuery({
      queryKey: config.queryKey,
      queryFn: config.queryFn,
      ...config.options,
    });
}

/**
 * Creates a type-safe mutation hook
 * @example
 * ```ts
 * const useCreateUser = createMutationHook({
 *   mutationFn: (data: CreateUserData) => apiPost<User>('/users', data),
 *   onSuccess: () => {
 *     queryClient.invalidateQueries({ queryKey: ['users'] });
 *   },
 * });
 * ```
 */
export function createMutationHook<TData, TVariables = void, TError = ApiError>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: MutationOptions<TData, TVariables, TError>
) {
  return (): UseMutationResult<TData, TError, TVariables> =>
    useMutation({
      mutationFn,
      ...options,
    });
}

/**
 * Hook to invalidate queries after a mutation
 * Useful for invalidating multiple query keys after an action
 */
export function useInvalidateQueries() {
  const queryClient = useQueryClient();

  return (queryKeys: QueryKey[]) => {
    for (const queryKey of queryKeys) {
      queryClient.invalidateQueries({ queryKey });
    }
  };
}

/**
 * Hook to reset queries
 * Useful for clearing cache or resetting to initial state
 */
export function useResetQueries() {
  const queryClient = useQueryClient();

  return (queryKeys: QueryKey[]) => {
    for (const queryKey of queryKeys) {
      queryClient.resetQueries({ queryKey });
    }
  };
}
