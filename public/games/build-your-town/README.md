# Build Your Town

This directory contains the bundled browser game and its local extensions.
`index.html` is the entry point. Run the repository's `rtk bun run dev` command
from the repository root and open `/games/build-your-town/`.

## File layout

| Directory | Responsibility |
| --- | --- |
| `assets/` | Compiled game engine and base stylesheet |
| `src/ui/` | Main menu, loading screen, dialogs, view controls, coverage queries, onboarding |
| `src/world/` | Showcase city, buildings, recreation, landscaping, terrain, map rotation |
| `src/transport/` | Road layouts, bridges, rail signals, trains, vehicles, pedestrians |
| `src/progression/` | Missions, career scenarios, endgame definitions, encounters, cheats |
| `src/disasters/` | Disaster recovery and fire response |
| `src/platform/` | Audio and save import/export |

Stylesheets live beside the scripts they support. The root also holds the
favicon, crawler metadata, and upstream attribution in [SOURCE.txt](SOURCE.txt).
The shared activity script is supplied by the parent games directory.

## Runtime integration

The extension scripts are browser scripts that register hooks on `window`.
The compiled engine calls those hooks during initialization and gameplay.
`index.html` owns script ordering: keep the current order when changing paths
or adding extensions. In particular, the loading screen and extension hooks
must register before the engine module starts.

Moving a script does not change save storage: cities and preferences continue
using the existing `citybuilder.*` local-storage keys. Do not rename those keys
as part of file organization.

The engine is compiled upstream code with local patches, rather than the
original engine source tree. Keep edits in the readable extension scripts
where possible; changing this layout does not rebuild the engine.

## Validation

From the repository root, run `rtk bun run lint`, `rtk bun run lint:oxlint`,
and `rtk bun run build`. Check that local `src` and `href` paths in `index.html`
resolve, then manually check startup, sandbox creation, loading a saved city,
career scenarios, and returning to the main menu. Do not add automated test
files to this repository.

Building definitions and progression details are documented in
[the endgame guide](../../../docs/build-your-town-endgame.md).
