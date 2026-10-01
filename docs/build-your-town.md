# Build Your Town

Open Fun → Games → Build Your Town. It loads automatically and includes the shared Fullscreen control and game activity bridge. Keyboard, pointer, and touch input reset the idle lock timer. Click inside the game before using keyboard shortcuts.

## Offline behavior

The city builder is a static browser game. All runtime files are bundled under `public/games/build-your-town/`; no dependency was added to the main app. Graphics are generated with Canvas. Google Fonts links were removed; typography uses the upstream system fallback stacks. External GitHub and LinkedIn credit links require internet only when clicked.

Gameplay needs no internet connection when the app is served on localhost or a reachable local network. The dashboard still requires normal authentication and app host access. There is no offline cache guaranteeing a remote hosted page reloads after disconnecting. Use an HTTP server rather than opening the HTML directly from the filesystem.

Cities and preferences are saved in localStorage using upstream `citybuilder.*` keys. Save data belongs to the browser and app origin. The upstream game provides English and French interfaces, multiple city saves, and autosaving every 15 seconds.

## Controls

- R / C / I: residential, commercial, industrial zones.
- T: roads; L: power lines; B: bulldozer; Q: inspect.
- Arrow keys, right/middle drag, or Space + drag: pan.
- Wheel: zoom; P: pause; 1 / 2 / 3: speed.
- Esc: clear tool or close panels. In fullscreen, Esc first exits browser fullscreen.

## Source and rebuilding

Source: [Rapsody09/buildyourtown](https://github.com/Rapsody09/buildyourtown/tree/d12a19973a331e392ac8db80cedb9ec0e18c1444), commit `d12a19973a331e392ac8db80cedb9ec0e18c1444`, version 0.7.0. Upstream attribution is preserved. This revision has no license file or declared package license; no license has been inferred.

Clone separately, check out this revision, run `bun install --ignore-scripts`, apply [the offline patch](build-your-town-offline.patch) using `git apply`, and run `bun run build`. Copy `dist/` into the game directory, preserve `SOURCE.txt`, and add `<script src="../activity.js"></script>` before `</head>` in the generated HTML. The build uses Vite 8.2.2 and TypeScript 5.9.3 from the upstream lockfile. Rebuilding needs internet unless dependencies are cached.
