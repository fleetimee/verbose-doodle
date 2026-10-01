# Ponpoko Kart

Open Fun → Games → Ponpoko Kart. It loads automatically with the same compact layout and Fullscreen control as the other games. Click inside the game before using keyboard controls. Navigate away to unload its renderer and audio.

## Offline behavior

The game can run without internet access when served by a local HTTP server. All runtime JavaScript and CSS are hosted under `public/games/ponpoko-kart/`. Three.js is bundled into those assets; no package dependency was added to the main app. Courses, models, graphics, music, and sound are generated locally. WebGL and Web Audio are required.

The upstream game injects Google Fonts requests. The local build removes that injection and uses the original CSS font fallback stacks, so it makes no Google Fonts requests. Japanese typography may vary with the fonts available on the device.

This is not an offline installation of Fleetime Labs. The dashboard still requires its normal authentication and host access. A hosted page is not guaranteed to reload while disconnected because the app has no offline cache. Opening the HTML directly from the filesystem is unsupported; use an HTTP server.

Preferences use the original `ponpoko.prefs` localStorage key in a same-origin iframe. The game retains its original Japanese interface.

## Controls

- W / Up: accelerate; S / Down: brake or reverse.
- A / D or Left / Right: steer.
- Space / Shift: jump and drift.
- E / X: use an item; C: look backward.
- Esc / P: pause. In fullscreen, Esc first exits browser fullscreen.

Gamepads are also supported. Audio starts after the first click or key press.

## Source and rebuilding

Source: [tanuu5/ponpoko-kart](https://github.com/tanuu5/ponpoko-kart/tree/916e6d955a476126c1e5b8023aaeb79e355a132c), commit `916e6d955a476126c1e5b8023aaeb79e355a132c`.

The game is MIT licensed. The game and Three.js license notices are included alongside the assets. The build uses Three.js 0.186.1 and Vite 8.3.1 from the upstream lockfile. The vendored build is excluded from Biome.

To rebuild, clone the source into a separate directory and check out the commit above. Run `bun install --ignore-scripts`, apply [the offline font patch](ponpoko-kart-offline-fonts.patch) with `git apply`, then run `bun run build`. Copy `dist/` into `public/games/ponpoko-kart/` and preserve the game `LICENSE` and Three.js `THREE-LICENSE` notices. Installation and rebuilding require network access unless dependencies are already cached.
