/**
 * Example usage of TanStack Query utilities
 * This file demonstrates how to create and use queries and mutations
 *
 * NOTE: This is an example file for reference. Delete it when you have real queries.
 */

import { useMutation, useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "./api";
import { useInvalidateQueries } from "./query-hooks";

// Example constants
const MILLISECONDS_PER_SECOND = 1000;
const SECONDS_PER_MINUTE = 60;
const ONE_MINUTE = MILLISECONDS_PER_SECOND * SECONDS_PER_MINUTE;

type Todo = {
  id: number;
  title: string;
  completed: boolean;
};

type CreateTodoInput = {
  title: string;
  completed?: boolean;
};

/**
 * Example 1: Basic query hook
 * Fetches a list of todos from the API
 */
export function useTodos() {
  return useQuery({
    queryKey: ["todos"],
    queryFn: () => apiGet<Todo[]>("/todos"),
    // Optional: Add custom options
    staleTime: ONE_MINUTE, // 1 minute
  });
}

/**
 * Example 2: Query with parameters
 * Fetches a single todo by ID
 */
export function useTodo(id: number) {
  return useQuery({
    queryKey: ["todos", id],
    queryFn: () => apiGet<Todo>(`/todos/${id}`),
    enabled: id > 0,
  });
}

/**
 * Example 3: Mutation with automatic cache invalidation
 * Creates a new todo and refreshes the todo list
 */
export function useCreateTodo() {
  const invalidateQueries = useInvalidateQueries();

  return useMutation({
    mutationFn: (input: CreateTodoInput) => apiPost<Todo>("/todos", input),
    onSuccess: () => {
      invalidateQueries([["todos"]]);
    },
  });
}

/**
 * Example 4: Using the hooks in a component
 *
 * ```tsx
 * function TodoList() {
 *   const { data: todos, isLoading, error } = useTodos();
 *   const createTodo = useCreateTodo();
 *
 *   if (isLoading) return <div>Loading...</div>;
 *   if (error) return <div>Error: {error.message}</div>;
 *
 *   return (
 *     <div>
 *       <ul>
 *         {todos?.map(todo => (
 *           <li key={todo.id}>{todo.title}</li>
 *         ))}
 *       </ul>
 *
 *       <button
 *         onClick={() => {
 *           createTodo.mutate({ title: "New Todo" });
 *         }}
 *       >
 *         Add Todo
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
