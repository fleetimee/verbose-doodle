# Game storefront media

Use this workflow when adding a game or refreshing its storefront media. Capture the actual bundled game so the preview matches what opens when a player clicks its card.

The storefront lives in `src/pages/dashboard/games.tsx`. Games run under `public/games/<slug>/index.html`; their dashboard routes are listed in `src/features/games/routes.tsx`.

## Deliverables

For each game, produce:

| Asset | Location | Content |
| --- | --- | --- |
| Cover | `public/games/covers/<slug>.jpg` | A readable title screen or a strong gameplay frame |
| Gameplay stills | `public/games/previews/<slug>/01.jpg` through `04.jpg` | Four distinct moments of active gameplay |
| Optional video | `public/games/previews/<slug>/preview.webm` | A short, silent gameplay clip |
| Capture notes | `public/games/previews/<slug>/capture.md` | Controls, scene setup, capture steps, and any limitations |

These are generated static assets. The storefront does not capture or regenerate them at runtime. The storefront now uses covers and per-game gameplay stills in its floating hover panel. Fall Lines and Sunbreak also have silent looping video previews. The game entries in `src/pages/dashboard/games.tsx` explicitly list the screenshot filenames and optional video.

Capture at 1280 × 720 with device scale factor 1. Keep all images at 16:9. Save JPEGs around quality 80 and aim for less than 200 KB each without making text unreadable. A video should be roughly 8–12 seconds, under 3 MB where practical, and contain active gameplay throughout. Prefer a broadly supported WebM codec such as VP8. Strip audio and inspect the exported file before using it.

## Capture workflow

1. Start the development server with `rtk bun run dev --host 127.0.0.1`. Use the actual port printed by Vite.
2. Open `/games/<slug>/index.html` directly in a fresh browser context. This captures the game without the dashboard chrome or an authenticated session. Use browser automation or interactive browser controls already available to the agent. Keep temporary tooling outside the repository unless durable tooling is part of the request.
3. Set the viewport before loading the game. Wait until the title screen, assets, and rendering are visibly ready. The first batch of covers used a 3.5-second delay; do not assume that delay is sufficient for every game or machine.
4. Capture the cover. Inspect the image for loading screens, blank canvases, missing textures, clipped titles, and errors. Choose a gameplay frame instead if the title screen makes a poor cover.
5. Read the game's visible controls and instructions. Start a local single-player session and dismiss menus, tutorials, and dialogs. Create disposable worlds or saves if needed; use a fresh context so existing player saves are unaffected. Avoid multiplayer or external services for media capture.
6. Play the game using its real controls. Capture four visibly different frames that explain its mechanics, such as driving through a turn, building a town, moving a chess piece, exploring terrain, or breaking bricks. Use the game's mechanics to choose scenes. Four delayed screenshots of an idle title screen are not gameplay previews.
7. If recording video, start recording before the interaction sequence, then trim the recording to the active gameplay segment. Keep the camera and movement readable at card size. Remove loading, menus, setup, and empty lead-in time. Do not use a stretched still image as a video substitute.
8. Save the files at the paths above and write `capture.md`. Record the game's local URL, viewport, exact start steps, inputs and timings, scene or seed when available, and the frame or clip selection. Note whether headless rendering worked or required a visible browser.
9. Inspect every exported asset. Check the cover and stills at desktop card size and mobile width. Play the video through once, verify that it decodes, and check file sizes. If a game cannot be captured reliably, leave its existing cover intact and report the specific failure. Do not publish a blank or broken replacement.

Readiness and gameplay steps vary by game. Record them per game rather than assuming a universal Enter key or click position. For canvas games, visible readiness checks and observed gameplay are more useful than waiting for network inactivity.

## Hover preview behavior

The reference is Steam's floating hover preview: the store card keeps its cover while a panel beside it shows the game title, gameplay media, and supporting details. Use the existing game description in our panel. Include genre tags only when actual game metadata supplies them. Do not invent release dates, reviews, ratings, prices, or friend activity.

When implementing the hover panel and its media carousel, follow this contract:

- Render the static cover immediately and keep it visible on the card. Place the preview in a floating panel beside the card, using the existing theme and a fixed 16:9 media area. Switching media must never shift the card or panel layout.
- After about 350 ms of sustained pointer hover, show the panel and fade its gameplay media in over 200 ms. Rotate stills every 2.5 seconds with a crossfade. Keyboard focus should provide the same preview opportunity.
- Position the panel to the right when space allows, flip it to the left near the viewport edge, and constrain its width and vertical position to the visible viewport. Allow a small pointer travel grace period so moving into the panel does not close it. Avoid clipping by scroll containers.
- If a video exists, it may replace the still carousel. Play it muted, inline, and looped. Use the first gameplay still as its poster. If playback fails or is rejected, use stills or the cover.
- Start loading preview media only when the card is about to preview. Do not run hidden games in iframes or preload every video. Only one card preview should run at a time.
- When neither the card nor its panel is hovered or focused, close the panel, stop timers, and pause video. Escape dismisses the panel and cancels its playback without moving focus or navigating. Clean up timers and playback when the card unmounts.
- Keep clicking anywhere on the card as a direct link to the game. Preview media should not intercept clicks or introduce a details-page step.
- On touch devices, keep the static cover and let the first tap open the game. Do not require a first tap to reveal a preview.
- With reduced motion enabled, show a static gameplay still in the panel and disable automatic cycling, fading, and video playback. Also skip automatic video playback when a data-saving preference is available.
- Missing or failed preview assets fall back to the cover. Decorative images use empty alternative text; the game title names the link. Do not announce each rotating image to screen readers.

Keep the preview paths explicit in the game catalog when wiring them up. A game can have only a cover, a cover plus stills, or all three media types. Do not assume that every game's video or stills exist.

## Reusable agent instruction

Copy this task and replace the slug list:

> Read `docs/game-storefront-media.md` and capture storefront media for these bundled games: `<slugs>`. Inspect each game's controls, capture a cover and four distinct active gameplay screenshots, and record a short silent gameplay clip where browser recording and encoding tools are available. Use the documented paths and write per-game capture notes with reproducible steps. Inspect every output before replacing existing assets. Preserve player saves, game code, and unrelated work. Report files produced, file sizes, checks performed, and any games or video captures that could not be completed. Media capture alone does not require implementing the hover carousel.

For a follow-up carousel task:

> Read `docs/game-storefront-media.md` and `DESIGN.md`. Implement the floating hover panel and media carousel contract in the existing game storefront using the captured media. Preserve direct game navigation, localization, keyboard access, touch behavior, and the existing theme. Add meaningful coverage for delayed hover cancellation, timer cleanup, viewport positioning, Escape dismissal, and media failure fallback. Run the relevant tests, lint, and production build, then verify desktop and mobile behavior.
