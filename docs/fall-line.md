# Fall Line

Open Fun → Games → Fall Lines from the dashboard sidebar. The game loads automatically when the page opens. Navigate away to unload its renderer and audio.

The original single HTML file includes Three.js and all game code. No package dependency or external asset request is required. The app lazy-loads the page and loads the 1.14 MB game when the route opens.

The iframe allows scripts and pointer lock but cannot access the parent app, cookies, or storage. The original game catches unavailable localStorage; personal bests do not persist between play sessions. Its original English UI and controls are retained. WebGL is required.

Source: [Nipale-ai/opus-5-5-overnight-builds](https://github.com/Nipale-ai/opus-5-5-overnight-builds/tree/8d35d834bc3d62cb772ae9f75b95b89c9600ab82/fall-line).

Imported unchanged from `fall-line/index.html`, blob `6361695b828c3a701c406ee562a665f083bd385f`. The upstream repository does not declare a license at the time of import.

Use Fullscreen in the page header to expand the game to the display. Press Esc to return to the dashboard. The control is disabled when the browser does not support fullscreen.
