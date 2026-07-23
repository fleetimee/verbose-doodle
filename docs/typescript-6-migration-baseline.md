# TypeScript 6 to 7 Migration Baseline

Captured on 2026-07-23 from commit `cbcd83fb8e9cab0885bef8aa19289ea8f9376f67`, before any TypeScript migration edits. This baseline supports issue #73 and is intended to be compared with the TypeScript 7 result in the following migration tickets.

## Compiler boundary

| Check | Result |
| --- | --- |
| Runtime | Bun 1.3.14 |
| Compiler | TypeScript 6.0.3 (`bunx tsc --version`) |
| Command | `bun run type-check` → `tsc --noEmit` |
| Exit status | `0` |
| stdout | `$ tsc --noEmit` |
| stderr | Empty |
| Diagnostics | None |

The TypeScript 6 baseline is clean. The command should be rerun from the migration branch after compiler/configuration changes, and its output compared with this record. A diagnostic is new only when it is absent from this baseline and present in the TypeScript 7 result.

## Build artifacts

No TypeScript build-information files were found outside dependency directories. The two configured build-info paths are intentionally under ignored dependency storage:

- `tsconfig.app.json` → `node_modules/.tmp/tsconfig.app.tsbuildinfo`
- `tsconfig.node.json` → `node_modules/.tmp/tsconfig.node.tsbuildinfo`

This repository therefore has no stale non-dependency `.tsbuildinfo` artifact to remove before migration.

## Compiler configuration inventory

There are three compiler configurations and no `extends` relationships:

| Configuration | Role | References/inheritance | Relevant contract |
| --- | --- | --- | --- |
| `tsconfig.json` | Root project-reference coordinator | References `tsconfig.app.json` and `tsconfig.node.json`; its `compilerOptions` are not inherited by referenced projects | `@/*` → `./src/*` path mapping |
| `tsconfig.app.json` | React/Vite application | No `extends`; included files are `src` | ES2022, ESNext, bundler resolution, DOM/DOM.Iterable, JSX `react-jsx`, explicit `vite/client` and `@types/bun` globals, strict checks, no emit |
| `tsconfig.node.json` | Vite configuration | No `extends`; included file is `vite.config.ts` | ES2023, ESNext, bundler resolution, explicit `node` globals, strict checks, no emit |

The application configuration repeats the `@/*` path mapping because project references do not inherit the root coordinator's compiler options. `baseUrl` is not present in any config. Vite resolves the same alias to `src` in `vite.config.ts`.

The current configurations already deliberately use strict checking, ES2022/ES2023 targets, ESNext modules, bundler module resolution, explicit global type packages, and no emit. These are the options to preserve unless TypeScript 7 produces a concrete incompatibility.

## Compiler-API audit and compatibility decision

The audit covered application/source files, the package manifest, lockfiles, installed tooling package metadata, and installed tooling runtime/declaration files:

- No application source or repository configuration imports `typescript`, `ts-morph`, `typescript-eslint`, or another TypeScript compiler API.
- The manifest has no direct compiler-API dependency. It contains `typescript` only as the root compiler dependency.
- Installed `shadcn@4.11.0` uses `ts-morph@26.0.0` for source transforms. Installed `@vercel/node@5.8.17` imports `ts-morph@12.0.0` and carries a nested `typescript@5.9.3`.
- Neither package is called by the repository's `build`, `type-check`, test, lint, Docker, or deployment validation commands. They are optional/manual tooling dependencies rather than consumers of the root compiler process.

Decision for the next ticket: do not add a `@typescript/typescript6` compatibility alias at this stage. TypeScript 6 compiler-API consumers are absent from the repository's active workflows; the identified transitive tools already isolate their own older compiler/`ts-morph` dependencies. Revisit this decision only if issue #74 makes one of those tools run in-process with the root compiler or finds a new direct consumer.

## Package and lockfile audit

Bun is the package-manager authority. The manifest declares `typescript: ^6.0.3`, `bun.lock` resolves the root compiler to `typescript@6.0.3`, and Docker installs with `bun install --frozen-lockfile`. The normal compiler invocations are:

- `package.json` `type-check`: `tsc --noEmit`
- `package.json` `build`: `tsc -b && vite build`
- `Dockerfile`, `Dockerfile.production`, and `Dockerfile.kantor.deploy`: `bun run build`

The obsolete npm `package-lock.json` was not coherent with the Bun-managed project and has been removed. Dependency resolution is governed by `bun.lock`, the package scripts, and the Docker build files.

No repository CI configuration directory was found. Deployment documentation contains file-copy instructions and Docker workflows, but no separate TypeScript invocation.

## Migration handoff

- Baseline diagnostics: clean under TypeScript 6.0.3; no source-level fixes are required by this ticket.
- Configuration changes: none in this ticket; the inventory above is the review reference for issue #74.
- New TypeScript 7 diagnostics: not applicable until issue #74 updates the compiler/configuration contract.
- Compatibility risk: manual `shadcn` and Vercel tooling use older `ts-morph`/TypeScript dependencies; keep them out of the root compiler path unless compatibility is explicitly designed.
- Runtime behavior: unchanged; this ticket adds only migration documentation.
