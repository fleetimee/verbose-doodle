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

## Day and night

The calendar and day/night lighting share one clock. A game day takes 60 seconds
at 1×, 30 seconds at 2×, and 15 seconds at 4×. Months use actual lengths and
Gregorian leap years (28–31 real minutes at 1×). Dates advance at midnight;
pause, background tabs, and the main menu freeze calendar progress.

City saves include `dayTime` and `calendar` (day, pending daily budget, fractional
cash remainder, and encounter scheduling). Legacy saves map `tickInMonth` onto
the equivalent position in their month; fresh cities start on day 1 at 08:00.
No catch-up charges or offline progress apply when loading.

Growth probabilities retain the old equivalent of 25 trials per month, spread
across hourly updates. Demand smoothing retains its original monthly rate.
Population, networks, service coverage, pollution, and the monthly budget
forecast refresh hourly. Land value, crime, disaster chances, historical reports,
and the six-month bankruptcy grace period retain their monthly cadence.
Emergency response continues on the existing 120 ms simulation interval at 1×.

Tax income, upkeep, ordinances, and loan interest accrue proportionally as time
passes and settle each midnight. Budget panels continue to show monthly amounts.
Fractional cash is carried across days and saves rather than rounded away.
Encounter cooldowns and chance checks retain their previous frequency per
simulated month, and pause or the main menu cannot generate encounter rewards.
Accelerated showcase/scenario city generation retains its original simulation.

The clock beside the speed controls includes a daylight viewing toggle. This
preference changes map lighting only; activity continues to follow city time.
Flat views and data overlays retain their original lighting for readability.
Night reduces decorative traffic and general pedestrian activity while keeping
leisure destinations busier. Power generation is unchanged; lighting does not alter the economic forecast.

For manual verification, open `/games/build-your-town/index.html?demo&showcase&zoom=1`
in an isolated browser profile. Pause, set `window.__city.dayTime` to 7, 12, 19,
or 22 in the browser console, and call `window.__townView.redraw()` to compare
dawn, day, dusk, and night. Check the daylight toggle, speed controls, language
switching, flat/data views, and the main menu. Round-trip a city through
`window.__City.fromJSON(window.__city.toJSON())` to check the clock; remove
`calendar` from the exported object to verify legacy save migration.

For calendar checks, use `window.__townCalendar.advance(city, milliseconds, speed)`
on a disposable city in the isolated browser profile, with the running game
paused. A 60,000 ms advance at 1× spans one complete day. Check midnight,
February/leap-year and December rollovers, daily budget totals against the monthly
forecast, partial-day save/load, and 0×/1×/2×/4× progression. Never advance a player
save for capture or QA.
