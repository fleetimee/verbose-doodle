# Frontend dependency update review — 2026-07-31

Repository: `biller-simulator-json`  
Branch: `nov-dev`  
Package manager: Bun 1.3.14

## Decision

Applied the conservative Target updates listed below. Deferred the remaining candidates because they affect routing, charts, build/deployment tooling, code generation, exact pins, or pre-1.0 behavior. No “Latest” value was selected when it crossed a meaningful compatibility boundary.

## Applied

| Package | Before | After | Reason |
| --- | ---: | ---: | --- |
| `@fontsource/geist-mono` | 5.2.8 | 5.3.0 | Font asset update |
| `@fontsource/mona-sans` | 5.2.8 | 5.3.0 | Font asset update |
| `@hookform/resolvers` | 5.4.0 | 5.5.7 | Compatible form-validation update |
| `@shikijs/transformers` | 4.2.0 | 4.3.1 | Paired with Shiki |
| `@tailwindcss/vite` | 4.3.1 | 4.3.3 | Paired with Tailwind |
| `@tanstack/react-query` | 5.101.0 | 5.101.4 | Paired with devtools |
| `@tanstack/react-query-devtools` | 5.101.0 | 5.101.4 | Kept in sync with Query |
| `@uiw/react-codemirror` | 4.25.10 | 4.25.11 | Editor wrapper update |
| `@types/node` | 25.9.4 | 26.1.2 | Type-only update; TypeScript 7.0.2 accepts the declarations, and the repository's Node/Vite toolchain remains compatible. |
| `@types/react` | 19.2.17 | 19.2.18 | React type patch |
| `@types/react-dom` | 19.2.3 | 19.2.4 | React DOM type patch |
| `motion` | 12.41.0 | 12.43.0 | Animation library update |
| `react` | 19.2.7 | 19.2.8 | React patch |
| `react-dom` | 19.2.7 | 19.2.8 | React DOM patch |
| `react-grab` | 0.1.47 | 0.1.50 | Same pre-1.0 update line |
| `react-hook-form` | 7.80.0 | 7.83.0 | Form library update |
| `react-icons` | 5.6.0 | 5.7.0 | Icon library update |
| `react-resizable-panels` | 4.11.2 | 4.12.2 | UI utility update |
| `react-router` | 8.0.1 | 8.3.0 | Compatible with the app's declarative routing setup; type-check, build, lint, and routing-focused tests pass. See the [official 8.3.0 changelog](https://reactrouter.com/start/start/changelog). |
| `recharts` | 3.8.1 | 3.10.1 | Low-risk minor update; type-check, build, lint, and chart-adjacent tests pass. See the [upgrade research](recharts-upgrade-research-2026-07-31.md). |
| `@vercel/node` | 5.8.17 | 5.9.3 | Compatible with the existing typed serverless proxy and Vercel rewrite configuration; dependency, type-check, build, and lint validation pass. |
| `vite` | 8.0.16 | 8.2.0 | Compatible with the existing Vite 8 plugins and config; frozen install, type-check, build, and lint pass. See the [official 8.2.0 changelog](https://github.com/vitejs/vite/blob/v8.2.0/packages/vite/CHANGELOG.md). |
| `shadcn` | 4.11.0 | 4.16.0 | CLI-only update; existing Base UI component sources and `components.json` required no regeneration. Frozen install, CLI smoke test, type-check, build, and lint pass. See the [official 4.16.0 release notes](https://github.com/shadcn-ui/ui/releases/tag/shadcn%404.16.0). |
| `@happy-dom/global-registrator` | 20.10.6 | 20.11.1 | The prior Base UI `getAnimations` incompatibility did not reproduce; targeted scroll-area-related tests pass. See the [package release](https://www.npmjs.com/package/@happy-dom/global-registrator). |
| `cnfast` | 0.0.8 | 0.1.0 | Pre-1.0 minor validated through the shared `cn` utility; frozen install, utility tests, type-check, build, and lint pass. See the [package metadata](https://www.npmjs.com/package/cnfast). |
| `@vitejs/plugin-react` | 6.0.2 | 6.0.5 | Exact-pinned Vite 8 plugin patch; stable compiler peer is satisfied. Frozen install, type-check, build, and lint pass; the full suite completes with the existing 7 dashboard test failures. See the [official changelog](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/CHANGELOG.md). |
| `babel-plugin-react-compiler` | 19.1.0-rc.3 | 1.0.0 | Stable React Compiler release; kept exact-pinned per React’s upgrade guidance because memoization changes can expose behavioral issues. Full test suite shows no new failures. See [React Compiler v1.0](https://react.dev/blog/2025/10/07/react-compiler-1). |
| `@biomejs/biome` | 2.5.0 | 2.5.6 | Updated with Ultracite; its mechanical cleanup was applied across the repository and lint now passes. Unsafe object-key sorting remains disabled because it changed runtime insertion order in the `cn` utility test. |
| `ultracite` | 7.8.3 | 7.9.4 | Updated with Biome; the new diagnostics were resolved through mechanical fixes and scoped rule policy for React handlers, runtime guards, and intentionally sequential loops. |
| `shiki` | 4.2.0 | 4.3.1 | Paired with transformers |
| `tailwindcss` | 4.3.1 | 4.3.3 | Paired with Vite plugin |

`@codemirror/view` was requested at 6.43.7 but remains installed at 6.43.1 because `package.json` intentionally pins it in `resolutions`.

`@types/node` 26.1.2 is compatible with this repository's current toolchain: local Node is 22.22.3, Vite 8 requires Node 20.19+ or 22.12+, and TypeScript is 7.0.2. Because this package only supplies declarations, it does not upgrade the runtime Node version. Projects that intentionally promise only Node 22 at runtime may prefer the matching `@types/node@22` line to avoid exposing newer Node APIs to TypeScript; this frontend already used the newer 25.x declaration line and its build/test workflows remain green after the update. See the [Vite 8 Node support note](https://vite.dev/blog/announcing-vite8) and [@types/node package metadata](https://www.npmjs.com/package/@types/node).

## Deferred Target updates

| Package | Current | Target | Why deferred |
| --- | ---: | ---: | --- |

## Not selected from Latest

| Package | Current | Latest | Reason |
| --- | ---: | ---: | --- |

## Validation

Before updating, the repository checks were exercised; build and lint passed. The initial full-test invocation did not retain a final exit summary, so the post-update results below are the authoritative recorded evidence:

- `bun run build`
- `bun run lint`

After the update:

- `bun run build` passes.
- `bun run lint` passes.
- `bun run type-check` passes.
- `bun test` now runs the normal suite first and the DashboardLayout breadcrumb suite in a fresh second Bun process via `tools/run-tests.ts`; this isolates its happy-dom document and global fetch mocks while preserving the existing preload polyfills.
- Ultracite/Biome initially reported approximately 1,500 diagnostics; after mechanical cleanup and policy adjustments, all 439 checked files pass with zero diagnostics.
- The `useSortedKeys` assist is disabled because sorting object keys can change insertion-order-sensitive runtime behavior; the `cn` object-input test remains green with its original key order.
- `@happy-dom/global-registrator` 20.11.1: targeted scroll-area-related tests pass; its existing preload polyfill remains intact.
- `@types/node` 26.1.2: compatible with the repository's TypeScript 7.0.2 toolchain and Node 22.22.3 development runtime; it updates the root Node declarations and `undici-types` to 8.3.0. This is a type-only major update, so it does not change the deployed Node runtime. The latest package metadata is published on [npm](https://www.npmjs.com/package/@types/node).
- Before the runner change, `bun test` reproduced 7 DashboardLayout breadcrumb failures from cross-file DOM contamination (duplicate `Biller` comboboxes and stale mutation state). The DashboardLayout file itself passed 15/15 in isolation.
- The updated `bun run test` command completes the normal suite and then reruns DashboardLayout in a fresh process, eliminating those 7 failures.
- The `@happy-dom/global-registrator` 20.11.1 update no longer reproduces the earlier `viewport.getAnimations` incompatibility; it remains applied after targeted tests and full-suite validation.

The repository retains its pre-existing React `act(...)` and Motion animatability warnings; they do not fail the test command.

## Recharts follow-up

Recharts is now at `3.10.1`. The app uses charts in the overview and endpoint metrics screens, plus a shared wrapper in `src/components/ui/chart.tsx`.

The [research report](recharts-upgrade-research-2026-07-31.md) found no migration blocker. Type-check, build, lint, frozen lockfile install, and the chart-adjacent test files pass. A manual visual check of the user-status Pie label remains worth doing because 3.10.1 changes computed Pie radius handling.
