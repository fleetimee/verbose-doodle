# Build Your Town endgame

The bundled game loads `public/games/build-your-town/endgame.js` before its
engine starts. That file owns the additional building definitions, English and
French names, isometric drawing routines, construction-menu entries, and career
eras 6 and 7.

## Buildings

Unlocks use the city's highest recorded population, matching the original game.
Costs below are base prices; the game's difficulty rules apply to construction
and upkeep.

| Building | Unlock population | Footprint | Cost | Monthly upkeep | Effect |
| --- | ---: | --- | ---: | ---: | --- |
| Solar farm | 12,000 | 3 × 3 | $8,000 | $8 | 180 MW, no pollution |
| Geothermal plant | 35,000 | 3 × 3 | $22,000 | $28 | 750 MW, no pollution |
| Desalination plant | 20,000 | 3 × 3 | $18,000 | $35 | Water within 24 tiles; needs shoreline and 12 MW |
| Municipal reservoir | 50,000 | 4 × 4 | $30,000 | $45 | Water within 34 tiles; needs 6 MW |
| University | 20,000 | 4 × 4 | $16,000 | $45 | Education within 24 tiles; needs 8 MW |
| Medical center | 35,000 | 4 × 4 | $25,000 | $65 | Health services within 24 tiles; needs 12 MW |
| Police headquarters | 25,000 | 3 × 3 | $14,000 | $38 | Police services within 24 tiles; needs 6 MW |
| Fire command center | 25,000 | 3 × 3 | $14,000 | $38 | Fire services within 24 tiles; needs 6 MW |
| Botanical garden | 30,000 | 4 × 4 | $18,000 | $30 | Park coverage within 16 tiles improves land value |
| Grand museum | 40,000 | 3 × 3 | $16,000 | $28 | Park coverage within 14 tiles improves land value; needs 5 MW |
| Residential tower | 40,000 | 3 × 3 | $25,000 | $60 | 2,500 residents and 500 taxable jobs; needs roads and 18 MW |
| Research campus | 60,000 | 4 × 4 | $40,000 | $90 | 2,500 taxable jobs and education within 16 tiles; needs roads and 20 MW |

Services use the existing department-funding sliders. New buildings that consume
power provide their coverage only while powered. Housing and research buildings
also need a road within the engine's existing three-tile access distance to
contribute residents, jobs, or taxes. Their road connections become destinations
in the commuting network.

## Progression

Sandbox cities show seven eras in the Career Hub. Era 6 adds clean-power,
advanced-water, public-service, and culture goals for a 50,000-resident city.
Era 7 adds research districts, broad service coverage, a healthy population of
100,000, and a debt-free treasury of $500,000. Objectives check the city's actual
state and grant their reward once per saved city.

During a scenario, general career missions remain disabled until Gold is earned.
The completed floating tracker then offers **Open endgame goals**. Only eras 6
and 7 are available for that scenario city, so earlier tutorial missions cannot
inject rewards into the scenario. Restarting a scenario resets its current-run
medals and endgame mission progress, while previously earned scenario medals stay
in the scenario browser.

## Engine integration and saves

The engine in `public/games/build-your-town/assets/index-DCrPNbHR.js` has small
integration points for registering the expansion before city loading, extending
construction menus, drawing the additional buildings, and accounting for their
power, coverage, employment, commuting destinations, and taxes. Preserve those
integration points when replacing the upstream game bundle. `index.html` versions
the engine URL so browsers request the updated runtime.

The existing save format stores building types and positions. Existing cities
continue to load. Cities containing expansion buildings require this updated
runtime when imported; an upstream copy without these definitions cannot load
the additional types.

Single-city exports and full backups include scenario-run medals and the starting
baseline as optional fields. This keeps the endgame transition available after
importing a completed scenario on another machine. Older exports still import;
when they lack scenario-run data, the current run starts with no claimed medals.

## Manual checks

- Open the game directly at `/games/build-your-town/index.html` in a separate
  browser origin or profile to avoid changing player saves.
- In a disposable city, use Cheats to add construction funds and unlock the
  roster. Check the Energy, Water, Services, Parks, and Advanced districts menus.
- Construct new buildings on flat, empty land. Connect power and roads, then
  inspect their service coverage and monthly budget. Desalination requires a
  shoreline.
- Save, reload, and import/export a city containing the new types. Compare its
  buildings, population, jobs, and power supply.
- Open Career Hub and inspect eras 6 and 7. Check that incomplete scenarios
  cannot earn career rewards and completed scenarios expose only endgame eras.
- Repeat construction-menu navigation at a narrow viewport. The existing mobile
  flyout scrolls when the expanded roster exceeds its height.

Do not add automated test files. Use the repository's lint and production-build
checks, JavaScript syntax checks for the bundled scripts, and manual runtime
checks.

## Pedestrian activity

`pedestrians.js` adds temporary canvas residents to sidewalks near developed
residential, commercial, and industrial zones, parks, transport, and public
destinations. Nearby development controls density, capped at 240 people across
the map. Pedestrians walk along connected local road segments and turn back at
ends and before corners or intersections; they avoid highways, rail crossings,
water, floods, and fire. Marked, signal-controlled crosswalks appear automatically
on selected flat, straight road sections near development. Residents wait at the
curb, cross to the opposite sidewalk on green, then continue walking. These are
ambient residents, not individual economic agents or saved state.

Movement follows pause and the three game speeds. Reduced-motion preferences
keep residents visible without walking. People are hidden below 0.5 zoom, in
flat view, and while viewing data maps. City changes reset the population;
development changes refresh sidewalk activity every two seconds.

For a visual check, open a developed city at 0.5 zoom or closer. Look for small
people with colored shirts along nearby road edges, then compare pause and
faster speeds. Switch to flat view or a data map to check that people disappear.
Use a separate browser origin for capture so player saves remain separate.

Crosswalks use an 18-second cycle at normal speed: nine seconds for traffic,
two seconds to clear vehicles, three seconds to admit pedestrians, and four
seconds to finish crossing. Vehicles stop behind the markings while pedestrians
cross. Signals, pedestrians, and crossing traffic share a simulation clock,
including off-screen crossings, pause, and faster game speeds. Crosswalks are
ambient visuals and do not change commute calculations, funding, or saved data.

For a crossing check, look for white zebra stripes and small paired signal
lamps on a flat local street. People should wait at the center of the sidewalk,
then cross while vehicles are held behind the stripes. Existing walkers turn
back at junctions; crosswalks connect the two sides of straight streets.

## Service vehicles

`service-vehicles.js` adds police cars, ambulances, and ladder-equipped fire
engines to the native isometric renderer. Police stations and headquarters
provide patrol cars; hospitals and medical centers provide ambulances; fire
stations and command centers provide fire engines. Each eligible building
provides one vehicle, capped at six per service type. Buildings need funding
and an adjacent connected road; advanced service buildings also need power.

Vehicles follow local roads and highways within their service radius, stop for
people at signal-controlled crossings, and return after a round. Fire engines
prefer a reachable road near an active fire and pause there before returning.
Ambulances make service rounds because the game has no individual patient
incidents. These visuals preserve existing crime, health, firefighting, and
commute calculations; they do not add simulation agents to saves.

Routes avoid destroyed, flooded, burning, water, and rail-crossing tiles.
Removing a station or disabling its department funding retires its vehicles.
Movement and roof lights follow pause and game speed; reduced motion freezes
both. Vehicles are hidden in flat view, data maps, and below 0.5 zoom.

For a manual check, connect funded police, hospital, and fire buildings to a
local road network, then zoom in. Look for a blue-striped police car, a white
ambulance with a red cross, and a red engine with a roof ladder. Trigger a
nearby fire and watch the engine travel toward it. Check a marked crossing,
pause, and zero department funding.

## Merged two-way roads

`road-layout.js` automatically recognizes two parallel rows of flat local road,
at least three tiles long, at the same elevation. The two rows render as one
continuous boulevard with outer curbs, a shared double center line, direction
arrows, and opposing traffic. A single road also shows both traffic directions
when there is traffic, including light traffic that previously showed one car.

Place the second row beside the first in either map direction. No extra tool,
upgrade cost, or save migration is required. Each placed tile retains its
existing construction cost, upkeep, and traffic capacity. Highways, bridges,
slopes, rail crossings, and small corner blocks retain their existing rendering.
Bulldozing a row immediately restores ordinary road rendering where the pair
breaks.

Pedestrians use outer sidewalks on the merged road. Automatic crosswalks remain
on single-width streets; crossing a whole boulevard needs a separate future
layout. Service vehicles follow the direction of each boulevard half and return
via the opposite half, changing sides at road ends rather than mid-block.

For a manual check, build two adjacent rows at least three tiles long and connect
a developed neighborhood. Look for continuous asphalt and cars moving in
opposite directions. Repeat in the other map direction, then bulldoze one tile
to check that the split updates.

Merged roads also receive a narrow landscaped median with raised edging,
small broadleaf trees, compact conifers, and low shrubs. Planting alternates
along the road and is drawn once per paired segment. The first and last
segments stay clear for turns, and planting stops at junctions or broken pairs.
This landscaping is automatic decoration, adds no upkeep or saved objects,
and preserves both vehicle lanes and the outer pedestrian sidewalks.

## Manual landscaping

The parks menu starts with Tree ($10), Small tree ($6), and Bushes ($4). Choose
a plant, then click empty, flat land to place a one-tile decoration. These
plants need no road, power, or upkeep. Existing buildings, roads, utilities,
water, and occupied land retain their placement protections.

The same tools customize a merged-road median: click either road half in a
segment away from ends and junctions. This changes the center planting while
preserving the road, lanes, and sidewalks. Choosing the same manual planting
again is rejected without charging. Choices persist in city saves and exports;
older saves keep automatic median planting. Bulldozing a road half clears its
manual median choice. Ground plants use normal building removal.
