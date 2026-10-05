@/Users/fleetime/.codex/RTK.md

# Repository guidance

- Use Bun; `package.json` defines scripts and dependency versions.
- Read [README.md](README.md) for setup, [PRODUCT.md](PRODUCT.md) for product
  scope, and [DESIGN.md](DESIGN.md) for UI changes. Operational docs live in `docs/`.
- Keep changes scoped to the task. Preserve unrelated work and avoid broad
  formatting, dependency upgrades, or new abstractions without a concrete need.

## Code

- Startup: `src/main.tsx`. Global providers: `src/app.tsx`.
  Route composition: `src/app-routes.tsx`; feature routes: `src/features/*/routes.tsx`.
  Feature logic: `src/features/`.
  Route pages: `src/pages/`. Shared utilities: `src/lib/`.
- Follow neighboring code. Use `@/` for source imports, named exports for
  application components, and kebab-case filenames.
- Reuse existing API, auth, query, and UI utilities. Preserve session handling,
  role checks, and protocol behavior when changing integrations.
- Follow `biome.json`, including its shared UI overrides. Keep design tokens in
  `src/index.css`; use the existing translation system for localized copy.

## Game media

- When adding games or capturing storefront covers, gameplay screenshots, or preview
  videos, follow [docs/game-storefront-media.md](docs/game-storefront-media.md).
- Use actual bundled-game captures and record reproducible per-game steps. Preserve
  player saves and keep media capture separate from runtime game execution.

## Validation

- For code changes, run `rtk bun run lint` for Ultracite/Biome,
  `rtk bun run lint:oxlint` for Oxlint, and `rtk bun run build`.
  Build checks TypeScript project references; the current `type-check` script
  alone does not check those referenced projects.
- For docs-only changes, check links and `rtk git diff --check`.
- Report what changed, checks run, and any failures or checks left unrun.

## Tests

Do not create, restore, or add automated test files in this repository.
Do not add test suites, test scripts, test setup files, or test dependencies.
Validate changes with lint, the production build, and relevant manual checks.
