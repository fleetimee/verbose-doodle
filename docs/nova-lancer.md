# Nova Lancer

Open Fun → Games → Nova Lancer. The game loads automatically with the shared Fullscreen control and game activity bridge. Its original Japanese interface is preserved.

## Offline behavior

The game is a self-contained HTML file with bundled Three.js, procedural terrain and models, and locally synthesized Web Audio music and sound effects. Google Fonts links were removed; the original system fallback fonts are used. No dependency was added to the app.

Gameplay requires no internet when served through localhost or a reachable local network. The dashboard still requires authentication and access to its app host. No offline cache guarantees a remote hosted page reloads after disconnecting.

## Controls

- WASD / arrows: move.
- J / Space / Z / left click: shoot, hold to charge.
- K / B / X / right click: smart bomb.
- L / Shift / C: boost; I / V: brake.
- Q / E: roll with a quick double press.
- Esc / P: pause. Esc first exits browser fullscreen.

Gamepads and touch controls are supported. Audio begins after user interaction.

## Source and updating

Source: [tanuu5/nova-lancer](https://github.com/tanuu5/nova-lancer/tree/eb488caa96a3e283d3e79de6aa62e250143ee921), commit `eb488caa96a3e283d3e79de6aa62e250143ee921`. The game is MIT licensed. Game and Three.js notices are included alongside the HTML.

Copy the repository root prebuilt `index.html` into the game directory, remove the three Google Fonts link elements, and add `<script src="../activity.js"></script>` before `</head>`. Preserve license and source notices. No build is required to use the prebuilt file.
