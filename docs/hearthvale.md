# Hearthvale single-player

Open Fun → Games → Hearthvale. It loads automatically with Fullscreen and game activity tracking. Character creation, farming, exploration, crafting, fishing, mining, story systems, and local save slots are retained.

## Offline behavior

All game bundles, Three.js, procedural graphics, and synthesized audio are local. Google Fonts links and dynamic font loaders were removed; typography uses existing system fallback stacks. Hosting, joining, and relay auto-connect are disabled; co-op options are removed from the title and pause menus, and the co-op panel is not registered. Shared player profile code is retained for the single-player character creator. No Java backend changes or new main app dependencies are needed.

The app must still be served on localhost or a reachable local network and requires normal dashboard authentication. A remote hosted reload is not guaranteed after disconnecting. Save slots use upstream `hearthvale.save.*` localStorage keys in a same-origin iframe. Browser/site data removal deletes saves.

## Controls

WASD / arrows move; Shift runs. Left click / C / Space uses the tool; right click / X / F interacts. 1–0 selects toolbar slots; E opens inventory; Esc opens the menu. In fullscreen, Esc first exits browser fullscreen.

## Source and rebuilding

Source: [duolahypercho/hearthvale](https://github.com/duolahypercho/hearthvale/tree/9a66ae32c26406fc9577a8dd694e9e0d0628a89b), commit `9a66ae32c26406fc9577a8dd694e9e0d0628a89b`. Upstream declares no project license at this revision. Three.js license notice and source attribution are included.

Clone separately, check out the revision, run `bun install --ignore-scripts`, apply [the single-player patch](hearthvale-single-player.patch) using `git apply`, then run `bun run build`. Copy `dist/` into the game directory, preserve source and Three.js notices, and insert `<script src="../activity.js"></script>` before `</head>` in the generated HTML. Build dependencies are Three.js 0.186.0, Vite 8.3.0, and TypeScript 7.0.2. Rebuilding requires internet unless dependencies are cached.
