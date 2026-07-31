# Conservative dependency update scope

Accepted on 2026-07-31: apply the semver-compatible runtime, UI, and test-support updates that resolve without changing the application’s architectural boundaries; defer routing, charting, build-tool, deployment-tool, generator, exact-pinned, and pre-1.0 latest updates for isolated validation. The CodeMirror view package remains pinned at 6.43.1 because the existing CodeMirror integration deliberately pins it alongside `@codemirror/state`; that pin is not overridden by the routine update.

This keeps the update reviewable and preserves the existing behavior-heavy surfaces while still bringing the active React/UI dependency set forward.
