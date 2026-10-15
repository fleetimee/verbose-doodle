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

## Road and highway access

Residential, commercial, and industrial zones can develop within 12 tile steps
of a road or highway (four times the original three-tile access reach).
The shared access map also connects placed buildings to the nearest network
entry within that distance, measured from their footprint. Commuting and freight
then follow the actual connected roads/highways; isolated networks cannot supply
each other. Power, water, service coverage, and growth-tier requirements retain
their own rules. Zones occupy surrounding land, not the paved roadway itself.

Access is recalculated when routes are built, demolished, or destroyed and when
a city loads; existing saves require no migration. For manual QA in a disposable
flat city, place each R/C/I zone type 4, 12, and 13 tiles from a highway and an
ordinary road. With power, demand, and workers/jobs supplied, the first two
distances should develop; 13 tiles must show the missing-access blocker. Check
commuting, a placed industrial facility, save/load, and loss of access after
removing the only nearby road/highway. Keep player saves separate from QA.

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

Live zoning development accumulates saved progress toward the next tier instead
of relying on a random growth roll. Empty lots use 200 equivalent development
trials per day, then 80/40/20/10 at tiers 1–4. Rates retain the existing demand,
land-value, crime, pollution, and difficulty modifiers. A stable ±20% variation
in required effort keeps neighboring lots from upgrading together. Connected
starter layouts typically see their first homes/jobs within 1–2 minutes at 1×;
later tiers take longer. Growth freezes when demand or infrastructure is missing.
Demand responds daily (35% toward its target each day). Parks, services, pollution,
and crime update land value and crime at midnight. Abandonment uses four
equivalent trials per day, avoiding sudden neighborhood-wide losses.
Population, networks, service coverage, pollution, milestones, and the monthly
budget forecast refresh hourly. Disaster chances, historical reports, and the
six-month bankruptcy grace period retain their monthly cadence.

The city journal defaults to the last seven days, with 30-day, one-year, and
ten-year options. The chosen range is remembered as `citybuilder.journalRange`.
Daily population and funds snapshots are recorded during live simulation and
saved in `journalDaily` (up to 366 samples). The current day updates in place;
pause and background tabs do not manufacture history. Long-range charts combine
daily samples with the existing monthly history. Legacy saves keep their monthly
charts and begin daily recording when resumed. A new city immediately shows its
current values, even before a second daily snapshot exists.
Emergency response continues on the existing 120 ms simulation interval at 1×.

Tax income, upkeep, ordinances, and loan interest accrue proportionally as time
passes and settle each midnight. Budget panels continue to show monthly amounts.
Fractional cash is carried across days and saves rather than rounded away.
Encounter cooldowns and chance checks retain their previous frequency per
simulated month, and pause or the main menu cannot generate encounter rewards.
Accelerated showcase/scenario city generation retains its original simulation.

Selecting a residential, commercial, or industrial tile shows its current tier,
next-tier progress, and blocking conditions in the details panel, with a small
matching bar on the selected map tile. Tier 4 requires a connected, flat 2×2
block of tier-3 zones; tier 5 requires a 3×3 block of tier-4 zones. Progress waits
at 100% until the footprint is available. Tier 3 and above still need water.
Sparse `zoneGrowth` records preserve partial progress in city saves; older saves
start with zero progress. Demolishing or changing a zone/tier clears its progress.

For growth QA, use a disposable flat starter city with a powered road connecting
at least three residential and four industrial lots. Observe progress at 1× and
4×, then pause and verify it stops. Query each zone type and rotate/zoom the map
to check the selected-tile bar. Disconnect power and confirm the blocker appears
without clearing progress; reconnect it and verify development resumes. Export
and reload the disposable city to check partial progress, then remove `zoneGrowth`
from that export to check legacy loading. Check tier-3 water/land-value gates and
tier-4/5 footprints. Keep this QA separate from player saves.

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

## Resource industries

Selecting Industrial, or pressing I, opens a chooser for ordinary industrial
zoning, coal/iron/copper mines, a steel mill, a goods factory, and a freight
terminal. Ordinary zoning grows automatically without deposits; mines are placed
on matching deposits. The factory-outline button below
the construction tools opens the Industry & resources ledger. Use Show deposits
or select a mine to reveal resource locations; the ledger can locate each deposit.
Generic industrial zoning continues to develop normally.

Mines require the matching finite deposit, electricity, water, and road access.
Coal and iron feed steel mills; steel and copper feed goods factories. Supplies
stay within connected road/highway networks. Terminals or seaports beside a
continuous railway can transfer freight between road districts. Terminals,
operating seaports, and roads reaching a map edge provide limited export capacity.
The economy reserves two days of connected processors’ inputs before exporting
surplus, with goods and steel sold first. Local coal also reduces an existing
coal power plant’s upkeep by up to 40%; plants retain their usual fuel supply
when local coal is unavailable.

Industry advances hourly on the game clock. Deposits, facility inventories,
cumulative export income, and pending midnight income survive save/export/load.
Old cities receive deposits deterministically from their map seed. A facility
holds up to 240 units of each resource; demolishing it discards its inventory.
Exhausted mines stop and can be demolished. Changing the map view never changes
resource locations or inventories.

Models and paused/operating machinery are drawn with the game’s isometric
primitives. Hoists, excavator arms, crushers, conveyors, furnace sparks, forklifts,
and freight cranes follow simulation speed and stop when the facility cannot
operate. Reduced-motion mode keeps the machinery static. New hooks in the bundled
engine route placement, stats, budgets, rendering, and hourly simulation to
`src/world/industry.js`, `industry-models.js`, and `src/ui/industry-panel.js`.

For manual QA, use an isolated browser profile and a disposable flat city.
Connect the three mines, mill, factory, and terminal to one road and power/water
network. Inspect hourly input/output stocks and exports, then break the road:
processors must wait once their connected inputs are unavailable. Add terminals
and a continuous railway to reconnect the districts. Check power/water outages,
finite deposit exhaustion, full storage without exports, and local coal savings.
Verify paused and 1×/2×/4× animation, reduced motion, all four map rotations,
English/French UI, mobile panel scrolling, placement away from deposits, and
save/export/load round-trips including a legacy save without `industry`.

### Freight vehicles

Container trucks carry goods and steel; bulk carriers show coal and ore.
Locomotives and matching freight wagons appear when shipments use a railway.
These vehicles visualize actual hourly supplier-to-processor, local coal-fuel,
and export transfers. They follow the dispatched road/rail route, including
terminal transfers, lane directions, bridges, and track height. Routes through
fire/flood damage are unavailable; broken connections stop new deliveries.

Inventory and export income are accounted for at the hourly transfer, rather
than on animation arrival. The bounded fleet (up to 48 visible vehicle parts)
does not charge for vehicles or change simulation results when zoomed out,
paused, in a flat/data view, or using reduced motion. Reduced motion hides the
moving fleet. Vehicle positions follow the game clock, so speed controls and
background pause apply consistently. Recent dispatches are saved in the
optional `industry.freight` field; old saves start with no dispatches. The
transport code lives in `src/transport/freight-routes.js` and
`src/transport/freight-vehicles.js`.

For freight QA, use a disposable industry city and inspect trucks on a shared
road. Split the road between suppliers and processors and clear disposable
processor stocks: no new cargo should cross the cut. Reconnect using operating
terminals and continuous rails, then observe road → rail → road dispatches and
container/bulk consists. Check 1×/2×/4×, pause, save/reload mid-route, all four
rotations, road/rail damage, and hiding vehicles in flat/data/reduced-motion
views. Check the Industrial chooser and I shortcut on desktop, mobile, and in
both languages; ordinary zoning must still paint lots, and mines must still
require deposits.

## Help guide

Game menu → Help & controls opens a ten-topic guide. It explains starting a
neighborhood, navigation, construction, utilities, growth, mining, processing,
freight, budgets, and city services/saves in English and French. Use the topic
selector to jump directly to a subject, or Back/Next and Left/Right to browse.
The guide pauses the city and restores its previous speed when closed. Its
demonstrations use actual game sprites and never change city data.

Demonstrations have Pause/Play and Replay controls. Reduced-motion mode shows
static diagrams; hidden guides discard their demonstration nodes. The guide
traps keyboard focus, preserves native topic-selector keys, closes with Escape,
and returns focus to its opener. Topic actions close Help before selecting an
existing construction tool or opening the industry ledger/budget.

The readable implementation is `src/ui/help-guide.js` and `help-guide.css`;
the bundled engine delegates tutorial binding to `window.__townHelp`.
For manual QA, use a disposable city in an isolated browser profile. Browse all
topics on desktop and mobile in both languages, check scrolling and keyboard
navigation, pause/replay and reduced motion, then close using Done, Escape,
the close button, and the backdrop. Verify the original simulation speed returns
and topic actions open the intended tool/panel without changing funds or stock.

## Graphics quality

Interface settings includes Auto (default), Low, Medium, High, and Custom graphics.
Auto starts at Medium, or Low when reported CPU concurrency or device memory is
four or less. Missing hardware hints use Medium. It measures full map render
cost and animation-frame delays during foreground gameplay, waits three seconds
after changes, then requires two slow five-second windows to step down or three
comfortable windows to step up. Paused cities, hidden tabs, and the main menu do
not contribute samples. Auto choices are session-local so a later launch can
adapt to a different workload; manual settings persist as `citybuilder.graphics`.

Low uses up to 1× pixel density and 30 FPS, with static building effects and no
weather particles or decorative night lights. Medium uses up to 1.5× and 30 FPS,
fewer weather particles, six building-animation frames per second, and window
lights. High uses up to 2× and 60 FPS with full effects. Pixel density never
exceeds the display's native density. Seasonal colors and the day/night tint
remain in every preset; city simulation, saves, and emergency feedback are unchanged.

Moving any graphics slider selects Custom: resolution 75–200%, frame-rate limit
15–60 FPS, and visual effects Low–High. Resolution percentages are relative to
CSS pixels and capped at native density. UI scale and map zoom stay separate.
Selecting Custom from a preset starts with that preset's values.

For manual QA, use the disposable showcase URL above in an isolated profile.
Switch each preset and inspect `window.__townGraphics.state()` and the map canvas
pixel size. Move each slider, reload to check persistence, and switch back to
Auto. Compare rainy/night scenes and animated industry at each effects level;
verify all buildings, transport, emergency markers, and seasonal colors remain
readable. Check keyboard interaction, French labels, and mobile panel scrolling.
Compare foreground 1× gameplay, pause, and a hidden tab when checking adaptation;
compare an exported disposable city's simulation at the same elapsed game time
across graphics settings. Never benchmark or advance a player's save.
