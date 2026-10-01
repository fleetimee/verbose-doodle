# Sunbreak Downhill

Open Fun → Games → Sunbreak Downhill. It loads automatically with Fullscreen and game activity tracking. WebGL2 is required. Graphics and Web Audio are generated locally; there are no external runtime services. Three.js is bundled and no main app dependency was added.

The game needs no internet when served through localhost or a reachable local network. The dashboard still needs its app host and normal authentication. There is no offline cache guaranteeing a remote hosted app reloads after disconnecting. Best runs, ghosts, and effects preferences persist in browser storage.

## Controls

- W / Up: pedal; A / D or Left / Right: steer; S / Down: brake.
- Space: hold and release to hop; Shift: boost; C: manual.
- 1–7 while airborne: tricks.
- Esc / P: pause; R: restart; M: mute; V: weather; F: effects.

## Source and rebuilding

Source: [Imirushik/sunbreak-downhill-3D-game](https://github.com/Imirushik/sunbreak-downhill-3D-game/tree/72e7626a0a37e8db96adcb11678c8eef641f7714), commit `72e7626a0a37e8db96adcb11678c8eef641f7714`.

Clone separately, check out this commit, run `bun install --ignore-scripts`, then `bun run build --base=./`. Copy `dist/` into `public/games/sunbreak/`, preserve source and Three.js license notices, and add `<script src="../activity.js"></script>` before `</head>` in the generated HTML. Build versions are Three.js 0.185.1, TypeScript 5.9.3, and Vite 7.3.6. No project license is declared upstream at this revision.
