# Arkanoid Neon

Open Fun → Games → Arkanoid Neon. The game loads automatically with Fullscreen and game activity tracking. The game interface is translated from Swedish to English, including canvas menus, HUD, level names, power-ups, pause/game-over prompts, and audio messages. App navigation still follows the app locale.

## Offline behavior

The game uses local HTML, CSS, Canvas 2D, and synthesized Web Audio with no dependencies or build step. Google Fonts requests were removed in favor of the upstream fallback fonts. Gameplay needs no internet when the app is served through localhost or a reachable local network. The dashboard still requires its app host and usual authentication; a remote hosted reload is not guaranteed when disconnected.

The best score is saved locally using `arkanoid-neon-hi`. Mouse, keyboard, and touch controls are supported.

## Controls

- Mouse / Left / Right / A / D: move paddle.
- Click / Space: launch ball or fire laser.
- P / Esc: pause; Q while paused: return to menu.
- M: sound; N: music; F: fullscreen.

## Source and updating

Source: [Jack-c3l2w/arkanoid-neon](https://github.com/Jack-c3l2w/arkanoid-neon/tree/70e416d2320d3f7fb726384c8da99403be1a8ca4), commit `70e416d2320d3f7fb726384c8da99403be1a8ca4`.

Copy `index.html`, `style.css`, and `game.js` into the game directory. Reapply the English text translations, set HTML language to English, remove Google Fonts links, and add `<script src="../activity.js"></script>` before `</head>`. Preserve `SOURCE.txt` and the translated original in-game attribution. Upstream has no license file at this revision.
