@/Users/fleetime/.codex/RTK.md

## Tests

Keep the test suite thin. Add or update tests when they protect a meaningful
failure mode: business rules, protocol handling, authentication, data loss,
async state transitions, or a reproduced bug.

Do not add tests for every component or helper. Skip static copy, CSS classes,
simple prop rendering, trivial wrappers, third-party behavior, and runtime
checks of TypeScript types. Prefer an existing behavior test over duplicate
coverage at multiple layers. Keep boundary and error cases when they exercise
distinct application behavior.
