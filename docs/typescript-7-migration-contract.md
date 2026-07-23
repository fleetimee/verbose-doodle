# TypeScript 7 Compiler Contract

This document records the issue #74 package and compiler-configuration changes. The TypeScript 6 baseline is documented in [typescript-6-migration-baseline.md](./typescript-6-migration-baseline.md).

## Version decision

Issue #74 requested TypeScript 7.0.0. That exact package version is not published in the configured npm registry: the published versions move from the 7.0.1 release candidate to stable 7.0.2. The repository therefore pins the first available stable TypeScript 7 release, `typescript: 7.0.2`, exactly in `package.json` and `bun.lock`.

The requested TypeScript 6 compatibility alias is not added. The #73 audit found no compiler-API consumer in the repository's active build, type-check, test, lint, Docker, or deployment workflows. The installed `shadcn` and `@vercel/node` tools keep their own older `ts-morph`/TypeScript dependency trees and are not imported by those workflows.

## Configuration changes

| Configuration | Change | Rationale |
| --- | --- | --- |
| `tsconfig.json` | No change; keep project references and the relative `@/*` path mapping | The root file is a project-reference coordinator. Its compiler options are not inherited by referenced projects, and `paths` is already relative to the config directory. |
| `tsconfig.app.json` | Add `rootDir: "./src"` | Application inputs live below the repository root; the source root is now explicit for TypeScript 7. Existing ES2022, ESNext, bundler resolution, strict checks, no-emit, explicit globals, and `@/*` mapping are preserved. |
| `tsconfig.node.json` | No change | Its only input, `vite.config.ts`, is at the config directory. Existing ES2023, ESNext, bundler resolution, strict checks, no-emit, and explicit Node globals are already deliberate. |

No configuration contains `baseUrl`, legacy module resolution, legacy module kinds, disabled interop flags, deprecation suppression, or an implicit global type list. The Vite alias remains aligned with the TypeScript `@/*` mapping.

## Workflow and lockfile contract

- `package.json` `type-check` remains `tsc --noEmit`.
- `package.json` `build` remains `tsc -b && vite build`.
- Docker continues to call `bun run build`.
- No `checkers`, `builders`, or other compiler parallelism flags were added.
- `bun.lock` is authoritative and resolves TypeScript 7.0.2 and its platform packages.
- The stale npm `package-lock.json` was removed; dependency resolution is governed by the Bun-managed `bun.lock`.

## Verification

- `bunx tsc --version` → `7.0.2`
- `bun run type-check` → pass with no diagnostics
- TypeScript 6 baseline comparison → no new diagnostics
- Runtime source and application behavior → unchanged

The exact 7.0.0 availability mismatch is the only unresolved issue-level uncertainty. If the requirement must remain exactly 7.0.0 rather than the available stable 7.0.2, the package must first be made available through an approved registry or artifact source.
