## Testing TODOs

- **Form Wiring**  
  `src/features/endpoints/forms/endpoint-form.tsx`, `src/features/endpoints/forms/response-form.tsx`  
  - Render with Testing Library to verify defaults, HTTP method highlighting, numeric inputs coercion, and schema errors on submit.  
  - Exercise the exposed refs (`reset`, `getValues`) to ensure handlers work.

- **Mutation Hooks**  
  `src/features/endpoints/hooks/use-create-endpoint.ts`, `use-create-response.ts`, `use-activate-response.ts`  
  - Wrap hooks in a `QueryClientProvider`, mock timers, and assert `setQueryData` / `invalidateQueries` behavior.  
  - Spy on `toast` calls to confirm success/error notifications fire.
