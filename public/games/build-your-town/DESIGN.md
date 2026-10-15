---
name: BuildYourTown
description: A shaded isometric town with compact, tactile management panels.
colors:
  bg: "#141a28"
  panel-flat: "#1d2538"
  border: "#35415f"
  text: "#f3ecd8"
  muted: "#a8b0c2"
  accent: "#f6b73c"
  accent-dark: "#c98a12"
  teal: "#3fc1c9"
  danger: "#ff6b57"
  ok: "#7ed957"
  coal: "#aab4c9"
  iron: "#e4a07c"
  copper: "#83cfba"
  steel: "#a9c9e7"
  goods: "#edce83"
typography:
  body:
    fontFamily: '"Nunito", "Segoe UI", system-ui, sans-serif'
    fontSize: "13px"
    fontWeight: 600
  title:
    fontFamily: '"Baloo 2", "Segoe UI", system-ui, sans-serif'
    fontSize: "16px"
    fontWeight: 800
rounded:
  button: "10px"
  panel: "14px"
---

## Overview

Extend the bundled game's existing world: small shaded isometric buildings, readable machinery, and warm lettering on navy controls. This document governs BuildYourTown, independently of the hosting application's design system.

**The Working Town Rule.** Models and motion explain what a facility does. Keep the city itself the main visual surface; management panels support it.

## Colors

Use amber for selected tools, primary actions, and section headings. Navy surfaces, cream text, muted secondary labels, and restrained borders continue the existing HUD. Teal, danger, and success retain their established utility roles.

Resource overlay colors come from `src/world/industry.js`: cool coal, warm iron, green copper, pale blue steel, and golden goods. Model materials are shaded independently: dark coal piles, rust ore, oxidized copper, steel framing, and yellow machinery. Preserve this distinction between legible map overlays and physical materials. Pair resource colors with names and quantities.

## Typography

Use the existing rounded heading and body stacks with their system fallbacks. Panel titles are strong; uppercase amber section labels use small type and expanded tracking. Recipes and secondary operational text use the incumbent compact scale (11px). Ledgers and quantities use tabular numerals and right alignment. Keep French and English copy readable without truncating essential state.

## Layout

The canvas fills the viewport. Desktop tools sit left; panels open beside them below the top bar. The industry panel is wider than the ordinary panel (430px), with wrapped controls above a native scrolling body. Use a two-column resource ledger and compact facility rows with adjacent actions.

At the existing mobile breakpoint (900px), panels span the available width above the bottom tools with rounded upper corners. Industry height is capped at 62dvh. Preserve native scrolling, visible scrollbars, safe-area clearance, and stable scroll position as simulation values refresh. Keep panel controls separate from map gestures and keyboard shortcuts.

## Elevation & Depth

Panels use the incumbent navy vertical gradient, thin border, inset highlight, and dark drop shadow. Buttons have a highlighted top and heavier lower border, with a short pressed displacement. Keep this tactile depth consistent with the HUD.

World depth comes from projected top and side faces, layered primitives, and correct occlusion. Extend the existing boxes, cylinders, polygons, and fine machinery lines rather than placing flat symbols over buildings.

## Shapes

Reuse soft panel and button corners. Industrial sites sit on low square bases with compact service yards; buildings remain angular and mechanically specific.

**The Silhouette Rule.** Each facility must remain identifiable without its label: coal mine headframe and wheel; iron mine stepped pit and excavator; copper mine cylindrical processing equipment; steel mill furnaces and tall stacks; goods factory skylights, crates, and forklift; freight terminal stacked containers and gantry crane.

## Components

Reuse the existing panel, header, buttons, and tool treatment. Industry adds a factory outline icon, deposit toggle and native resource select, resource ledger, facility actions, deposit links, and contextual query information. Avoid separate card containers around every row.

**The Operational Motion Rule.** Convey work through machinery: hoist wheel, excavator arm, copper agitator, conveyors, mill smoke and sparks, forklift, and crane. Production-dependent effects follow actual operating state and simulation speed. Pause freezes progress; reduced-motion preference renders a static frame. Keep useful static models visible when work stops, with the reason available as text in the query UI.

Use native buttons and selects, accessible names for icon controls, labelled panels, expanded/pressed states, and visible keyboard focus. Opening focuses the close control; closing or Escape returns focus to the opener. Simulation refreshes preserve the focused action and scroll position. Disabled build actions explain the unlock requirement.

## Do's and Don'ts

- Continue the existing isometric projection, shaded materials, navy panels, and amber actions.
- Make resource identity, facility state, and available actions readable through text as well as color or motion.
- Keep mobile panels scrollable and controls reachable without disturbing the map.
- Do not substitute generic warehouse boxes for the six distinct industrial silhouettes.
- Do not animate inactive production, bypass reduced motion, or rebuild focused controls unnecessarily during refresh.
- Do not import the parent application's visual identity into the game.

## Help guide

The shipped guide teaches workflows with a short opening instruction, a labelled sprite diagram, concise steps, and a contextual action. Its ten topics cover starting, navigation, building, utilities, growth, mining, processing, freight, budget, and town care. A labelled native topic select supports direct access; Back, Next/Done, and the numeric step indicator remain in the visible footer. Continue the existing navy modal and amber/teal accents rather than introducing a separate help identity.

Use actual game sprites for buildings and networks. The income illustration is a small outline diagram. Keep annotations and supporting notes at 12px, instructional body text at 14px desktop and 13px mobile, and headings at 20px desktop and 18px mobile. Connector arrows and plus signs are diagram notation (24px desktop, 20px mobile), not display typography. The cargo marker's tiny corner radius (2px) belongs to that square marker, not to the component radius scale.

CSS animation explains relationships while reading text stays stable: cargo moves over four seconds with linear timing; development cycles over six seconds with linear timing; navigation pans over six seconds with strong ease-in-out timing (`cubic-bezier(0.77, 0, 0.175, 1)`). Mining yield markers rise over four seconds. Provide Pause/Play and Replay controls; the town-care diagram is static. Reduced motion removes animation and transient markers, keeps sprites visible, and disables motion controls with an explicit static-demo label. Background tabs pause demonstrations; closing the guide removes its diagram nodes so hidden animations do not continue.

Keep the modal body natively scrollable within the viewport while its footer remains available. On narrow screens, reduce diagram spacing and provide 44px minimum heights for navigation, close, motion, and contextual-action buttons. Preserve teal focus outlines, labelled controls, a modal focus trap, Escape dismissal, and focus return to the opener. Opening pauses the simulation; closing restores the previous speed only when the same playable city is still active. Demonstrations never mutate the city.

## Industrial chooser and freight vehicles

The Industrial tool uses the incumbent native flyout. Ordinary industrial zoning comes first, followed by coal, iron, and copper mines, the steel mill, goods factory, and freight terminal. Preserve sprite previews, descriptive labels, and unlock information within this single group. The I shortcut opens the same chooser; arrows and Home/End navigate its choices, and Escape returns focus to the group opener. Keep the existing desktop and mobile flyout scrolling behavior.

Freight vehicles continue the world's shaded primitive drawing language. Road trucks have white cabs, ribbed material-colored containers for goods and steel, and open bulk hoppers showing dark coal, rust iron, or oxidized copper. Freight trains use a yellow diesel locomotive and matching cargo wagons. Keep vehicles small enough to read as working traffic within the city, using the existing road occlusion, bridge heights, train layer, and slope pitch. Preserve route positions and headings across map rotation by projecting from source-city coordinates.

Vehicles represent actual hourly transfers along connected road and rail routes. Their progress follows the game clock, including pause and speed changes; inventory and revenue settle independently of visual arrival. Preserve the bounded representation (48 visible vehicle parts and 64 retained dispatches) rather than attempting to depict every unit. Hide the fleet in reduced motion, flat view, and data-map views so cargo remains supplementary visual feedback, never the only way to understand production or trade.

## Building finance reporting

Keep building finances within the incumbent panel system, entered through Budget or a building's query details. The comparison panel ranks individual buildings or combined building types by income, net contribution, or upkeep, highest first. Names act as locate controls; grouped rows identify that locating selects the first building. Use a compact semantic table with tabular amounts, right-aligned numeric columns, restrained row separators, a totals footer, and softly emphasized negative net values. Native labelled selects control grouping and ranking.

**The Forecast Rule.** Label every figure as a monthly forecast, not lifetime earnings. Income combines taxes and exports; show coal fuel savings separately. Net combines income and savings, then subtracts upkeep adjusted for difficulty and service funding. Exports and savings reflect the latest simulated hour. Query details expose taxes, export income, fuel savings, upkeep, and net contribution as a two-column ledger. State that services, stations, and freight terminals earn no fares or service fees; producer facilities receive export income. Keep citywide costs and any unattributed trade outside the building ranking visibly explained.

Preserve readable English and French labels, locale-formatted currency, and explanatory notes at the existing compact scale. On mobile, retain all comparison columns in a horizontally scrollable, keyboard-focusable table region within the vertically scrolling panel. Keep focus and both scroll positions stable when forecasts refresh, and preserve visible focus indicators and Escape dismissal.

## Context explanations

Use small outlined question-mark buttons next to the labels they explain. Keep
budget values right-aligned and place help inside the label column. Explanations
use one shared nonmodal popover with the incumbent navy surface, cream heading,
muted body copy, teal keyboard focus, and a visible close control. Anchor it to
the question mark and clamp it to the viewport; allow scrolling at small sizes.
Clicking help must never change an associated slider, checkbox, or map tool.
Support English/French copy, keyboard activation, Escape with focus return, and
outside dismissal without passing that click through to construction controls.

## Dedicated passenger rail

Keep the three rail systems visually distinct: ordinary timber-sleeper tracks,
light ballast/slab high-speed rail with white/blue tapered train cabs, and elevated
LRT viaducts with teal urban trains. LRT platforms align with the 24-unit viaduct
deck; show structural supports and street-level stairs/lift access so the station
reads as elevated. High-speed stations stay at ground level. Use the existing
isometric model primitives, transport chooser, amber selection, and bilingual
query help. Track and station descriptions must name their matching system and
flat-terrain restrictions.

Expanded construction help uses the same popover with more reading width and a
sticky close header. Render the real item model above its description; present
base figures in a compact two-column ledger. Separate placement requirements from
optional “Works well with” recommendations, each with a real model and a specific
reason. Locked-item help remains available. Keep item-card descriptions short
and put the longer material behind their independent help buttons.

Compact double-track railway draws both tracks inside one tile, like highway
lanes. Keep opposing trains on their corresponding track and leave a narrow
center strip for small planting or power poles. Older two-tile corridors retain
their geometry; never shift or delete saved infrastructure to compact them.
