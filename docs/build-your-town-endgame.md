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
| Beach carnival | 5,000 | 4 × 4 | $6,000 | $25 | Up to 90 Fun within 12 tiles and park coverage; needs shoreline, roads and 4 MW |
| Volleyball court | 500 | 2 × 2 | $250 | $2 | Up to 45 Fun within 6 tiles and park coverage; needs roads, no power |
| Soccer field | 1,000 | 4 × 4 | $1,500 | $8 | Up to 65 Fun within 10 tiles and park coverage; needs roads, no power |
| Shopping mall | 10,000 | 4 × 4 | $12,000 | $35 | Up to 75 Fun within 14 tiles, park coverage and 600 taxable jobs; needs roads and 8 MW |
| Residential tower | 40,000 | 3 × 3 | $25,000 | $60 | 2,500 residents and 500 taxable jobs; needs roads and 18 MW |
| Research campus | 60,000 | 4 × 4 | $40,000 | $90 | 2,500 taxable jobs and education within 16 tiles; needs roads and 20 MW |
| Skyline apartments | 60,000 | 4 × 4 | $60,000 | $140 | 6,000 residents and 1,200 taxable jobs; needs roads and 36 MW |
| Office skyscraper | 75,000 | 4 × 4 | $85,000 | $190 | 6,500 taxable jobs; needs roads and 48 MW |
| Metropolitan supertall | 100,000 | 4 × 4 | $160,000 | $350 | 10,000 residents and 5,000 taxable jobs; needs roads and 90 MW |

Services use the existing department-funding sliders. New buildings that consume
power provide their coverage only while powered. Housing and research buildings
also need a road within the engine's existing three-tile access distance to
contribute residents, jobs, or taxes. Their road connections become destinations
in the commuting network.

Advanced districts includes three endgame skyscrapers alongside the existing
residential tower and research campus. Skyline apartments use two terraced
residential towers, the office skyscraper has a glass facade and rooftop antenna,
and the metropolitan supertall has a stepped crown and spire. Their models fit
the existing sprite headroom so roofs and antennas remain visible on the map
and in construction previews. All use the existing population, commercial jobs,
commuting destinations and tax calculations, with no new saved fields. Housing
also contributes to the resident-weighted Fun average. Upkeep appears under
Parks, following the existing advanced-building budget behavior.

For a manual check, inspect population locks in Advanced districts, then build
each tower with road and power connections. Compare population, jobs, power
demand, upkeep and taxes. Disconnect roads or power to check that residents,
jobs and taxes stop contributing, then restore them. Save/reload and
export/import the city and compare the towers' types, positions and effects.
Inspect crowns and spires at close zoom and the construction menu at mobile
width. Earlier saves continue loading without migration; exports containing
these types require the updated runtime.

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

## Fun and recreation

`recreation.js` calculates a 0–100 Fun score from attractions near residents.
Small parks provide up to 20 Fun within 3 tiles, large parks 40 within 5 tiles,
botanical gardens 60 within 16 tiles, museums 60 within 14 tiles, and beach
carnivals 90 within 12 tiles. Volleyball courts provide up to 45 within 6 tiles,
soccer fields 65 within 10 tiles, and shopping malls 75 within 14 tiles.
Coverage decreases with distance and uses the
strongest nearby attraction, so overlapping attractions do not stack. Trees,
bushes and prestige buildings do not provide Fun.

Beach carnivals need water touching their footprint, power, and a local road
within the existing three-tile access distance from the building origin.
Volleyball courts, soccer fields and malls also require the same road access.
Fields operate without power; malls require 8 MW and add 600 taxable commercial
jobs while powered and road-connected, using the existing jobs, commuting and
tax calculations. Their upkeep appears under Parks in the budget, like other
recreation buildings.

Attractions stop providing Fun when burning or flooded; powered attractions
also stop when power is unavailable. A carnival without road access or its
shoreline provides neither Fun nor its park land-value bonus. Upkeep still
applies while closed and appears under Parks in the budget.

The city score averages local Fun by resident population, including powered
residential towers and arcologies. Empty cities show zero. Fun adds at most
0.12 to the residential demand target and 0.08 to the commercial target before
the existing clamp and monthly smoothing. It adds no penalty to cities without
recreation.

Fun appears below population, in Budget indicators, and in the tile query.
Attraction queries report whether the attraction operates. The Parks flyout
uses compact rows and scrolls within the viewport. Construction groups separate
Landscaping (trees and bushes), Parks (small park, large park and botanical
garden), Recreation (volleyball court, soccer field, beach carnival, shopping mall
and grand museum), and Landmarks (statue,
city hall, mansion and arcology). English and French are supported.

No save version or required field changes. The runtime continues to accept
versions 1–5. Fun coverage and the average are derived after loading, so older
cities immediately receive credit for their existing parks. Carnival type and
position use the existing structure serialization in city exports and backups.
Saves containing a carnival require the updated runtime, as with other expansion
buildings.

For the expanded roster, place each recreation building through its tool, check
construction charges and monthly upkeep, and remove roads to check that Fun stops.
Remove mall power to check that its Fun, jobs and taxes stop. Save/reload and
export/import a city with courts, fields and malls and compare their positions.

## Building animation

`building-activity.js` adds ambient activity to all 19 expansion building types.
Carnival wheels rotate with upright cabins, carousel riders circulate, volleyball
teams volley a ball, soccer players move around the pitch, and mall visitors walk
past sliding entrance doors. Gardens have visitors and butterflies; the museum
and university have visitors. Towers and the research campus have slowly changing
window lights, with roof beacons where their models include antennas. Medical,
police and fire buildings have staff activity or beacons. Solar panels receive
moving reflections, geothermal plants release drifting steam, and water buildings
show ripples.

The new building animations always use full motion, including when the system
requests reduced motion, following the requested game behavior. Pause freezes
their exact pose, including subsequent map redraws. The three running speeds
advance activity at 1×, 2× and 4×. These effects appear in the isometric view at
0.5 zoom or closer and are hidden in flat view and data maps. Existing pedestrian
and service-vehicle accessibility behavior is unchanged.

Buildings stop activity when burning, flooded, or missing their required power,
road access or shoreline. Department-funded services also need funding; research
jobs remain active under the existing employment rules. Closed carnival rides
keep their last pose; sports players and visitors leave closed facilities. Activity
resumes when operating conditions return.

The renderer paints reusable transparent activity canvases at 12 simulation
frames per second and clips them into the same columns as the native building
sprites, preserving occlusion. Up to 96 visible expansion buildings animate at
once; additional buildings retain their complete static models. Canvas storage
is bounded, removed buildings are discarded, and no animation frame becomes a
permanent sprite-cache entry. Construction icons retain static previews.

Activity is visual only. It changes no construction costs, Fun coverage,
population, jobs, taxes, traffic calculations or save format. Its clocks and
temporary actors are not serialized, so earlier cities need no migration.

For a manual check, open each building at close zoom and compare two poses while
running. Pause, then move the camera or refresh to confirm the pose stays fixed.
Compare normal and faster speeds, remove and restore power or roads, and check
closed facilities. Repeat with a system reduced-motion preference: the new
building activity should still animate. Save/reload and compare the city's
structures, residents, jobs and budget. Inspect overlapping buildings, mobile
view, flat view and data maps for occlusion or stray animation.

For a manual compatibility check, import an older city without Fun fields and
compare its funds, date, structures and population. Build a powered carnival
with shoreline and road access, place housing nearby, then save/reload and
export/import. Compare Fun and building positions. Remove power or nearby roads
and check that coverage stops; restore them and check that it returns. Inspect
the Parks flyout and Budget indicators at desktop and mobile widths.

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

The Landscaping menu contains Tree ($10), Small tree ($6), Cemara tree ($12),
Palm tree ($15), Flowering tree ($14), and Bushes ($4). Cemara has layered evergreen
foliage, palms have spreading fronds, and flowering trees have pink blossoms. Choose
a plant, then click empty, flat land to place a one-tile decoration. These
plants need no road, power, or upkeep. Existing buildings, roads, utilities,
water, and occupied land retain their placement protections.

The same tools customize a merged-road median: click either road half in a
segment away from ends and junctions. This changes the center planting while
preserving the road, lanes, and sidewalks. Choosing the same manual planting
again is rejected without charging. Choices persist in city saves and exports;
older saves keep automatic median planting. Bulldozing a road half clears its
manual median choice. Ground plants use normal building removal.

Existing median variant IDs 0–2 retain their original appearance. The new tree
choices use IDs 3–5 and persist in saves and exports. Earlier cities need no
migration; cities containing the new trees require this updated runtime.

Ground landscaping uses the native terrain palette instead of a bright park
foundation. Planted trees next to another planted tree or a natural forest tile,
including diagonally, render as varied groves of two to four trees per tile.
Removing the last neighboring tree restores a single tree. Ordinary and small
trees follow the nearby forest style; cemara stays evergreen, palms keep their
fronds, and flowering trees keep pink blossoms. Shrubs remain low clusters.
Tree sizes and positions vary deterministically, so save/reload preserves their
appearance without adding saved fields. Existing planted trees receive the new
appearance automatically; median planting keeps its existing rendering.

For a visual check, place two trees side by side and compare them with a natural
forest. Mix tree varieties, remove a neighbor, and reload the city. Compare the
ground tint and silhouettes at close zoom, on elevated flat land, and in flat
view. Costs and structure positions should remain unchanged.
