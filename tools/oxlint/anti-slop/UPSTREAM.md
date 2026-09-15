# Anti-slop provenance

- Source repository: https://github.com/dmmulroy/anti-slop
- Source commit: `c44ef22ca116d0ba62a3ff663a0bd13a3f3fa40b`
- Installed by: `skills/install-anti-slop/scripts/install.mjs`
- Installed entry point: `tools/oxlint/anti-slop/index.ts`
- Installed generic rule paths: `tools/oxlint/anti-slop/rules/` and `tools/oxlint/anti-slop/shared/`
- Vendored compatibility helpers and license: `tools/oxlint/anti-slop/vendor/eslint-stylistic/`

The Effect-specific rules under `effect/` are vendored with the upstream plugin
but are intentionally not registered because this project has no direct `effect`
dependency. The active rule set and Oxlint registration live in `.oxlintrc.json`.
