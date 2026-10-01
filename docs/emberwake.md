# Emberwake

Open Fun → Games → Emberwake. The game loads automatically and has the shared Fullscreen control. Click inside the game before using keyboard controls.

## Offline behavior

JavaScript, Three.js, sprites, and fonts are bundled under `public/games/emberwake/`. Audio is synthesized locally. No runtime internet connection or game server is needed when the app is served on localhost or a reachable local network. No dependency was added to the main app.

The dashboard still requires normal authentication and access to its app host. The app has no offline cache, so a remote hosted page is not guaranteed to reload after disconnecting. Serve the files through HTTP rather than opening the HTML directly from the filesystem.

The best score uses the upstream `emberwake.best` localStorage key. WebGL and Web Audio are required.

## Controls

- WASD / arrows: move.
- Space: dash.
- Esc / P: pause. Esc first exits browser fullscreen.
- M: toggle mute.
- R: replay after the game ends.

Gamepads are supported.

## Source and rebuilding

Source: [mogita/emberwake](https://github.com/mogita/emberwake/tree/46ebdb8574c2a87d9fcc8e2eddd77e1bfb91a0a5), commit `46ebdb8574c2a87d9fcc8e2eddd77e1bfb91a0a5`.

The game is MIT licensed. Game, Three.js, Pixelify Sans, and Silkscreen license notices are included beside the assets. The build uses Three.js 0.186.0, Vite 8.3.0, and Fontsource font packages 5.3.0.

Clone the source into a separate directory and check out the commit above. Run `bun install --ignore-scripts`, apply [the local path patch](emberwake-local-paths.patch) using `git apply`, and run `bun run build`. Copy `dist/` into `public/games/emberwake/` and preserve all four license notices. The patch sets a relative Vite base and changes sprite paths to work under the app game directory. Installation and rebuilding require internet unless dependencies are cached.
