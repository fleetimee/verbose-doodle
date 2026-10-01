# Terrabrowser

Open Fun → Games → Terrabrowser. The game loads automatically in the same compact page layout as Fall Lines. Click inside the game to use its keyboard controls. Navigate away to unload the renderer and audio.

Terrabrowser uses native Canvas and Web Audio with no libraries or package dependencies. Its HTML, stylesheet, and JavaScript modules are served locally from `public/games/terrabrowser/`; no external service or CDN is needed. The ES modules require an HTTP server, which Vite and the production host already provide.

Characters and worlds use the original IndexedDB storage with a localStorage fallback. This trusted, vendored game runs in a same-origin iframe so browser saves and ES module loading work. It shares the app origin and is not a security-isolated frame. Saves belong to the browser and origin, not the signed-in account. Use the in-game save menu before leaving; the app does not force a save on navigation.

Controls include A/D or arrow keys to move, Space to jump, left-click to use an item, right-click to interact, Esc for inventory, M for the map, and P for the pause/save menu. The original English game UI is retained.

Source: [Wimmboo2/Terrabrowser](https://github.com/Wimmboo2/Terrabrowser/tree/471220ee4e09495235ab038243296cd8f79da6bb).

Imported at commit `471220ee4e09495235ab038243296cd8f79da6bb`: `index.html`, `style.css`, and `src/`. Development scripts and reference material are not included. The upstream repository has no declared license at the time of import. Biome excludes these vendored assets.

Local integration patch: `src/input.js` explicitly focuses the canvas on mouse down before cancelling the default event. This lets character names, world names, and gameplay keys receive keyboard input inside the iframe. A regression test covers click-to-focus and text input.

## Export and import

The compact Export and Import controls share a button group above the game. The adjacent information icon opens a popover with backup guidance. Export opens a picker listing saved characters and worlds. Nothing is preselected; choose individual saves and confirm Export selected to download a versioned JSON file. During play, export pauses simulation and saves current progress first. Only selected records are included; settings are not included.

Return to the game menu before importing. Choose an exported JSON file up to 50 MB, then select which characters or worlds to restore in the preview dialog and confirm Import selected. Nothing is imported automatically. Older full backups are supported by the same picker. Import validates the backup before writing and creates copies with new IDs, preserving existing saves. Selecting both a character and its world preserves their bed links. A character imported without its world has no imported bed links. Repeated imports create additional copies.

Saves use one IndexedDB transaction, or a localStorage fallback that removes partial imports if storage fills up.

Local integration patches also include the backup helpers in `src/backup.js`, serialization and batch insertion in `src/save.js`, and the page bridge in `src/main.js`. Regression tests cover backup round trips, invalid files, ID remapping, and storage failure.

Use Fullscreen in the page header to expand the game to the display. Press Esc to return to the dashboard. The control is disabled when the browser does not support fullscreen.
