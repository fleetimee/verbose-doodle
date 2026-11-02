# Ultracite 8 and Biome 2.6

The project uses Ultracite 8.1.1 with Biome 2.6.4. Ultracite 7's core
preset references `useSortedClasses`, which Biome 2.6 renamed to
`useTailwindSortedClasses`. Ultracite 8.1 updates the preset and moves its
function configuration to the top-level Tailwind settings.

This upgrade separates tool compatibility from adopting stricter lint policies.
The initial check reported 2,058 errors. The following overrides are deliberate
migration deferrals, not claims that the reported code has been remediated:

- Tailwind class sorting is disabled globally for now. Biome 2.6 changes to
  Tailwind v4 ordering, producing 1,654 findings. This also removes automatic
  class-order enforcement outside the shared UI overrides; re-enable it in a
  dedicated class-order migration.
- Newly enabled regex policies (`useUnicodeRegex`, `useNamedCaptureGroup`),
  import placement, DOM query preferences, and instance-method usage are off.
  Review regex parsing and capture consumers before enabling their fixes.
- Newly enabled `noLoopFunc`, `noDuplicateSelectors`, `useBaseline`, and CSS
  property sorting are off. Review loop captures, CSS cascade, and supported
  browser targets separately before enforcing them.
- `useIframeSandbox` is deferred only for the existing game pages reported by
  the upgrade. These runtime embeds need a per-game capability review before
  sandbox restrictions change.
- `noLabelWithoutControl` stays enabled, with file-scoped deferrals for the
  eight existing component files newly reported by Biome. Review reusable label
  wrappers, group captions, and control associations before removing them.

Dependency checking remains enabled. The app's direct imports of
`@base-ui/utils`, `@codemirror/state`, `@codemirror/language`, and `@lezer/common`
are now declared dependencies at their previously installed versions.

Existing ignore patterns and shared UI overrides remain in place. No agent
instruction files were regenerated. Validate future policy changes with
`bun run lint`, `bun run lint:oxlint`, and `bun run build`.

Upstream references:

- [Ultracite 8.1 release notes](https://github.com/haydenbleasel/ultracite/releases/tag/ultracite%408.1.0)
- [Ultracite 8.0 release notes](https://github.com/haydenbleasel/ultracite/releases/tag/ultracite%408.0.0)
