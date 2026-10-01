# 3D Chess

Open Fun → Games → 3D Chess. The game loads automatically with the shared Fullscreen control and game activity tracking. It has 3D and 2D boards, three computer difficulty levels, notation entry, undo, and saved games.

## Offline behavior

The upstream prebuilt HTML bundles Three.js, chess.js, and a local computer opponent running in a Blob Web Worker. No remote AI service or runtime internet connection is needed. No package dependency was added to the main app. Board geometry and 2D SVG pieces are generated locally. The GitHub source link requires internet only when clicked.

The app must still be served on localhost or a reachable local network and requires its usual authentication. There is no offline cache guaranteeing that a remote hosted app reloads after disconnecting. Use an HTTP server rather than opening the HTML directly from the filesystem.

The same-origin iframe preserves the upstream `atelier-chess` localStorage save key. The 2D board is available when WebGL is unavailable. Click inside the game for keyboard controls.

## Source and updating

Source: [yortch/chess3dastra](https://github.com/yortch/chess3dastra/tree/f7748d0557c6f98a1255046810188e6a23dd0b63), commit `f7748d0557c6f98a1255046810188e6a23dd0b63`.

Copy the repository root prebuilt `index.html` into `public/games/chess-3d/index.html` and add `<script src="../activity.js"></script>` before `</head>`. Preserve `SOURCE.txt` and all embedded library license comments. No build is required to use this prebuilt file. The upstream repository has no project license file at this revision; no project license was inferred.
