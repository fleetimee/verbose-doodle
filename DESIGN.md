---
name: Fleetime Labs
description: A calm, precise instrument bench for integration work.
colors:
  harbor-teal-light: "oklch(0.51 0.08 185)"
  harbor-teal-dark: "oklch(0.67 0.075 185)"
  harbor-contrast-light: "oklch(0.985 0.004 180)"
  harbor-contrast-dark: "oklch(0.17 0.014 240)"
  cool-paper: "oklch(0.973 0.006 180)"
  porcelain-surface: "oklch(0.995 0.002 180)"
  ink-slate: "oklch(0.245 0.012 240)"
  quiet-slate: "oklch(0.485 0.016 230)"
  mist-border: "oklch(0.86 0.008 210)"
  deep-workshop: "oklch(0.19 0.014 240)"
  workshop-surface: "oklch(0.225 0.014 240)"
  workshop-text: "oklch(0.9 0.008 205)"
  workshop-muted: "oklch(0.67 0.014 220)"
  workshop-border: "oklch(0.34 0.014 235)"
  warning-red-light: "oklch(0.5594 0.19 25.8625)"
  warning-red-dark: "oklch(0.6591 0.153 22.1703)"
  chart-green: "oklch(0.58 0.06 170)"
  chart-blue: "oklch(0.62 0.045 215)"
  chart-indigo: "oklch(0.58 0.038 245)"
  chart-olive: "oklch(0.68 0.045 92)"
typography:
  clock:
    fontFamily: "Bangers, monospace"
    fontSize: "1rem"
    fontWeight: 400
    letterSpacing: "0.06em"
  display:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "clamp(2.25rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  title:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "1rem"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "normal"
  body:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.625
    letterSpacing: "normal"
  label:
    fontFamily: "Mona Sans, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.333
    letterSpacing: "0.18em"
  mono:
    fontFamily: "Geist Mono, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "calc(0.35rem - 4px)"
  md: "calc(0.35rem - 2px)"
  lg: "0.35rem"
  xl: "calc(0.35rem + 4px)"
  full: "9999px"
spacing:
  "1": "0.25rem"
  "2": "0.5rem"
  "3": "0.75rem"
  "4": "1rem"
  "5": "1.25rem"
  "6": "1.5rem"
components:
  button-primary:
    backgroundColor: "{colors.harbor-teal-light}"
    textColor: "{colors.harbor-contrast-light}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  button-outline:
    backgroundColor: "{colors.cool-paper}"
    textColor: "{colors.ink-slate}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    height: "2.25rem"
  input-default:
    backgroundColor: "transparent"
    textColor: "{colors.ink-slate}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "0.25rem 0.75rem"
    height: "2.25rem"
  badge-status:
    backgroundColor: "{colors.harbor-teal-light}"
    textColor: "{colors.harbor-contrast-light}"
    typography: "{typography.label}"
    rounded: "{rounded.full}"
    padding: "0.125rem 0.5rem"
  card-default:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.xl}"
    padding: "1.5rem"
  nav-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-slate}"
    typography: "{typography.body}"
    rounded: "{rounded.lg}"
    padding: "0.5rem"
    height: "2.25rem"
  endpoint-card:
    backgroundColor: "{colors.porcelain-surface}"
    textColor: "{colors.ink-slate}"
    rounded: "{rounded.lg}"
    padding: "1rem 0.75rem 1rem 1.25rem"
---

# Design System: Fleetime Labs

## Overview

**Creative North Star: "The Instrument Bench"**

Fleetime Labs should feel like a well-kept instrument bench. Every tool has a clear place, controls are compact, and status is readable without visual noise. Cool slate layers create the work area while Harbor Teal marks the controls and data that need attention.

The system is calm, precise, and pragmatic. Thin borders carry most of the structure. Short shadows and small movements make controls feel physical without turning the workspace into a toy. Information density is welcome when grouping, labels, and spacing keep the task legible.

**Key Characteristics:**

- Cool light and dark work surfaces with a restrained teal accent.
- Compact controls with crisp focus rings and subtle press feedback.
- Thin borders, close tonal layers, and selective shadows.
- Clear sans-serif hierarchy with monospace reserved for technical values.
- Dense modules that remain scannable at desktop and collapse cleanly on smaller screens.

## Colors

The palette pairs Harbor Teal with cool paper and slate neutrals. Light and dark themes use separately tuned values rather than mechanical inversion.

### Primary

- **Harbor Teal:** Use the light and dark theme variants for primary actions, selected states, focus rings, and the first chart series.

### Secondary

- **Measured Green:** Use for secondary chart data and positive operational signals, not decoration.
- **Instrument Blue:** Use for supporting chart series and HTTP semantics where blue already carries meaning.

### Tertiary

- **Quiet Indigo:** Use for tertiary data series that need separation from teal and green.
- **Ledger Olive:** Use sparingly for a fifth data series or a caution-adjacent value that is not an error.

### Neutral

- **Cool Paper:** The light workspace background.
- **Porcelain Surface:** The light card and popover layer.
- **Ink Slate:** Primary text on light surfaces.
- **Quiet Slate:** Secondary text on light surfaces.
- **Mist Border:** Dividers, input strokes, and card outlines in the light theme.
- **Deep Workshop:** The dark workspace background.
- **Workshop Surface:** The dark card, popover, and sidebar layer.
- **Workshop Text:** Primary text on dark surfaces.
- **Workshop Muted:** Secondary text on dark surfaces.
- **Workshop Border:** Dividers, input strokes, and card outlines in the dark theme.
- **Warning Red:** Destructive actions, invalid fields, and error states only. Use the theme-specific value.

**The Harbor Accent Rule.** Harbor Teal marks action, selection, focus, or data. Do not flood large background regions with it.

**The Theme Pairing Rule.** Tune each theme for its own contrast. Do not derive the dark theme by simply reversing the light theme.

**The Status Color Rule.** HTTP method colors and alert colors carry meaning. Do not reuse them as decoration.

## Typography

**Display Font:** Mona Sans with a sans-serif fallback.

**Body Font:** Mona Sans with a sans-serif fallback.

**Label/Mono Font:** Geist Mono with a monospace fallback.

**Character:** Mona Sans keeps the interface plainspoken and compact. Geist Mono separates paths, methods, payloads, tokens, and measured values from surrounding interface copy.

### Hierarchy

- **Display:** Bold responsive page titles use the display role. Keep them short and use tight tracking.
- **Headline:** Use semibold headlines for major panel or dialog titles.
- **Title:** Use semibold titles for cards, grouped controls, and list items.
- **Body:** Use regular body text for descriptions and working copy. Keep explanatory lines near 62 characters where the layout permits.
- **Label:** Use compact labels for eyebrows, categories, and status metadata. Uppercase with wide tracking is reserved for section cues.
- **Mono:** Use medium-weight monospace for endpoint paths, HTTP methods, payloads, identifiers, and numeric readouts.

**The Technical Type Rule.** Monospace signals machine-readable content. Do not use it for ordinary navigation, prose, or headings.

**The Label Discipline Rule.** Wide uppercase labels introduce sections; they do not replace body text or button labels.

## Layout

The desktop shell uses an inset, collapsible sidebar beside a bounded work area. The main header remains sticky and the content area uses a 1rem padding on small screens and 1.5rem from the medium breakpoint upward. Overview content stops at 1400px and centers within the available width.

The spacing rhythm follows a 4px base. Most component gaps and padding use 8px, 12px, 16px, 20px, or 24px. Pages stack in one column on narrow screens, then move to three-column or four-column dashboard grids at medium and large breakpoints. Dense editors and protocol tools may use resizable panes, but every pane must keep a usable minimum width.

**The Workbench Density Rule.** Prefer compact groups with clear labels over large empty areas. Add space at section boundaries, not between every control.

**The Collapse Without Loss Rule.** Responsive layouts may stack, hide secondary breadcrumb segments, or collapse navigation. They must preserve the current task, primary action, and status.

## Elevation & Depth

Depth is a structural hybrid. Borders and small tonal shifts separate most layers. The base shadow scale uses a hard 2px vertical offset with little or no blur, which gives controls a grounded edge. Dashboard cards may use a soft ambient shadow (`0 18px 45px -32px`) and a slight 2px lift on hover. Dialogs, sheets, menus, and floating actions use the stronger medium-to-large shadow steps.

### Shadow Vocabulary

- **Grounding Edge** (`0 2px 0 0` with low-opacity neutral): Inputs, outlined controls, and compact static surfaces.
- **Surface Edge** (`0 2px 0 0` plus a small 1px to 4px falloff): Cards, sidebar shells, and interactive list items.
- **Ambient Dashboard** (`0 18px 45px -32px` mixed from the foreground): Analytics cards that need separation from the canvas.
- **Floating Layer:** Medium and large scale shadows for dialogs, sheets, popovers, menus, and floating controls.

**The Structural First Rule.** Start with a border and a tonal shift. Add a shadow only when the layer floats, responds to interaction, or must separate from a dense background.

**The One Lift Rule.** Hoverable cards may rise by 2px. Nested controls inside the card should not rise independently.

## Shapes

The system uses compact, gently curved geometry. The base radius is 0.35rem. Standard controls use the medium radius, work cards and endpoint items use the large radius, and broad card containers use the extra-large radius. Full pills belong to badges, compact status chips, avatars, and floating circular actions.

Borders are part of the shape language. Most cards use a low-contrast 1px outline, and inset application shells use the same outline to define their silhouette. Avoid stacking several rounded containers when a divider or spacing group can express the hierarchy.

**The Radius Hierarchy Rule.** Small controls use tighter corners than the containers that hold them. Do not apply the largest radius to every layer.

## Components

### Buttons

- **Shape:** Compact rounded rectangle with a 2.25rem default height and medium corner radius.
- **Primary:** Harbor Teal fill, theme-appropriate foreground, medium weight, and 1rem horizontal padding.
- **Hover / Focus:** Slight color shift on hover, 3px translucent focus ring, and 3% press scale. Remove movement when reduced motion is active.
- **Secondary / Outline / Ghost:** Secondary uses a quiet tonal fill. Outline uses the workspace surface, a border, and a grounding edge. Ghost stays transparent until hover. Link buttons use Harbor Teal and underline on hover.

### Chips

- **Style:** Full-pill badge with compact label typography and minimal vertical padding.
- **State:** Primary and secondary variants use semantic fills. Outline badges remain neutral. HTTP method badges use their established protocol colors and Geist Mono.

### Cards / Containers

- **Corner Style:** Broad cards use the extra-large radius; denser work cards use the large radius.
- **Background:** Use the theme surface token, often at slight transparency over the workspace background.
- **Shadow Strategy:** Use a surface edge by default. Reserve ambient shadows for overview analytics and hoverable summary cards.
- **Border:** Use a 1px theme border, often at 60% to 70% opacity.
- **Internal Padding:** Use 1.5rem for broad cards and 1rem to 1.25rem for denser work items.

### Inputs / Fields

- **Style:** Transparent or lightly tinted field, 2.25rem height, medium radius, 1px input border, and a small grounding shadow.
- **Focus:** Shift the border to Harbor Teal and add a 3px translucent ring.
- **Error / Disabled:** Error states use Warning Red for border and ring. Disabled fields reduce opacity and keep their layout.

### Navigation

- **Style:** Sidebar items use compact 2.25rem rows, small icons, medium text, and large-radius corners. Active and hover states use the sidebar accent layer; active rows add a small grounding edge.
- **Responsive behavior:** The sidebar collapses to icons on desktop and becomes an off-canvas sheet on small screens. Group labels disappear when icon-only navigation is active.

### Endpoint Card

The endpoint card is the signature work item. It combines a semantic method strip, monospace method badge, endpoint path, biller metadata, and directional action in one compact row. A subtle lift, border shift, and arrow movement confirm interactivity without changing the card's structure.

### Tabs

Tabs sit inside a muted rounded track. The active tab returns to the workspace surface and gains a small grounding edge. Keep tab transitions limited to color and shadow so switching feels immediate.

### Server inventory

The inventory at `/dashboard/servers` sits in the sidebar's Workspace group and navigation search. Use the existing shadcn Table and Base UI wrappers with the dashboard tokens. Each access method has its own row, including when several entries share a host. TanStack Table 8 runs in manual pagination, sorting, and filtering mode. The backend supplies each page, filtered counts, and inventory-wide filter choices. Group access entries under a contrasting muted host header with a primary accent border, server icon, HOST label, host copy action; indent child names and display each entry’s port independently. Pagination counts hosts and keeps their matching entries together, defaulting to 50 hosts with 10 and 25 also available. Display known access types as colored icons, pairing database access with the engine logo. Show the full access type and engine in a keyboard-accessible tooltip; use a generic developer icon for custom access types and a database icon for engines without a known logo. Keep the search and filter controls compact and allow them and the pagination controls to wrap on narrow screens. Place search, filters, and column controls in the top toolbar of the same bordered table panel, with counts and pagination in its footer. On desktop, only the table scrolls vertically, with sticky column headers and the title, filters, and pagination outside the scrolling region. On mobile, the page scrolls vertically. Horizontal scrolling stays within the table.

`ADMIN` users have Add and password reveal actions in the table toolbar, with Edit entry and Delete entry in the details drawer footer. Delete still requires confirmation. `USER` users can browse metadata without mutation or reveal controls. The Host field suggests all distinct stored hosts using the same button-triggered searchable picker as Access type; users can search stored hosts or type a new address and select the Use action. The editor uses two field columns from the small breakpoint and one below it, with vertical scrolling inside the dialog. Leaving the password blank preserves it, entering a value replaces it, and a separate checkbox explicitly clears it. Clicking a row opens connection details and notes in the same right-side Drawer used by endpoint forms. Keep the web URL, database name, and created/updated timestamps in the drawer rather than table columns. Row buttons act independently. Reveal uses a direct API request rather than the query cache. Individual reveal shows the password inline in its table cell with Copy and Hide actions and a Sonner confirmation; the admin table switch reveals credentials only for the loaded page and clears them when the page changes. Hiding a password, hiding the tab, changing the loaded page, or reaching 30 seconds removes the reveal. Keep loading, empty, no-match, validation, and error states within the existing components, with English and Indonesian copy.

### QRIS MPM parser

The parser uses two bordered panels that fill the available desktop height, with a narrower input panel and a wider results panel whose field table scrolls independently. Stack the panels on mobile. The shadcn-style image dropzone uses a dashed button, a selected-image thumbnail, and visible decoding, success, and error states. Disable the monospace payload field while an image is decoding. Keep static and dynamic sample actions beside Clear in the compact tool header.

### QRIS MPM creator

The creator pairs a compact merchant form with a live QR preview and read-only monospace payload in stable-height bordered desktop panels, each using shadcn ScrollArea; stack the panels on mobile. Keep optional fields and image import collapsed until needed, show original imported tags in a nested disclosure, and disable the form during image decoding. Keep static/dynamic controls in the form and Clear in the tool header. Render the QR in black on white with its quiet zone intact in both themes and a small embedded app-icon logo; place merchant details, formatted amount, and PNG/SVG exports outside the code. Inline validation replaces an invalid preview with a clear empty state, and fictional sample identifiers remain visibly labeled.

### Retry & Backoff Calculator

The calculator pairs a narrower policy form with a wider results panel in two bordered panels with independent ScrollAreas; stack them below the large breakpoint. Keep Reset and Copy JSON in the shared tool header. Compact controls select fixed or exponential delays and none, full, or equal jitter, with the multiplier disabled for fixed delays. Results show expected and maximum totals, a paired delay bar chart, and an elapsed-time table including the initial attempt. Judge budget fit against each attempt's maximum finish and show a warning when attempts exceed the optional budget. Invalid fields replace results with an error alert and disable copying. Use localized labels and number formatting, monospace measured values, and a collapsed assumptions disclosure.

Keep numeric controls in a two-column grid, with field guidance inside the timing disclosure. Use compact panel headers, summary values, a 120px delay chart, and dense timeline rows so the default policy fits the desktop workspace; longer attempt lists retain panel scrolling.

### Schedule Overlap Checker

The checker uses the compact developer-tool template with bordered schedule and results panels that stack below the large breakpoint. The desktop route fills the dashboard viewport with constrained grid rows; expanding timing guidance scrolls within the schedule panel without growing the page. Configure 2–8 named cron schedules with durations, one shared timezone, and a specified start or current time for 6-hour, 24-hour, or 7-day elapsed previews. Reuse the shadcn calendar/time popover from Cron Parser for the start control, show cron expressions in labeled InputGroups, and keep Check overlaps pinned in the schedule panel footer. Use the shadcn Collapsible for timing notes and a timezone badge beside the report window. Show a prefilled sample report initially and after Reset; edits clear the stale report until Check runs again. Results pair run, conflict, and peak counts with a 120px concurrency chart and a height-adaptive conflict table with pagination fixed below its scrolling region. Include carryover runs and self-overlaps, with half-open intervals so touching end/start boundaries do not conflict. Show explicit validation and run/conflict-limit errors, keep Copy JSON disabled without a report, and use English and Indonesian copy with localized dates and numbers.

### HMAC signature

The HMAC-SHA-256 tool uses the compact developer-tool layout with two bordered panels that fill the desktop workspace and stack on smaller screens. Message and signing key each have independent UTF-8/hex controls. Results update from valid inputs, starting with a public example and its expected signature. Show hex/Base64 output, an independently encoded expected-signature field, a match status, byte counts, and a read-only hex preview of the exact signed message. Keep long content within panel scrolling. Preserve message whitespace; hex accepts whitespace separators and complete byte pairs. Validate input limits and encoding inline. Use Web Crypto when available and a bundled JavaScript HMAC-SHA-256 fallback on plain HTTP. Keep messages and keys in component memory only, with English and Indonesian copy.

### Games storefront

The Games index at `/dashboard/games` is a browse-and-play storefront inside the existing dashboard shell. Lead with a wide featured game screenshot beside its title, description, and Play now action. Below it, show a searchable library of all ten games with 16:9 screenshots captured from the bundled games, localized descriptions, and direct links to each game route. Keep the page on the existing theme tokens; stack the featured panel and library on mobile. Store cover images in `public/games/covers/`, lazy-load library images, and keep keyboard focus visible on the full-card links. Search matches game titles and descriptions and offers a clear action when there are no results. On desktop, sustained hover or keyboard focus opens one floating preview panel beside the card after 350ms. Keep the card cover visible; the panel shows the title, gameplay media, and description. Crossfade stills every 2.5 seconds or play an available silent looping clip. Flip the panel near viewport edges and keep it below the sticky header. Escape closes it. Load media only while the panel is open; reduced motion keeps a static still, and touch opens the game on the first tap.

### Screen lock

The lock button sits beside the theme switcher in the dashboard header. Locking reuses the macOS lock screen and provides a direct unlock action to resume the workspace. The screen also locks automatically after 2.5 minutes of user inactivity. The lock persists per tab across reloads until unlocked. A full-screen modal keeps keyboard focus and interaction within the lock screen.

The lock screen enters with a 450ms downward transform, like a shutter closing, and exits upward over 450ms upon unlocking. Reduced motion replaces these translations with 150ms fades.

## Do's and Don'ts

### Do:

- **Do** use Harbor Teal for primary actions, selection, focus, and key data.
- **Do** build hierarchy with borders, tonal layers, typography, and the 4px spacing rhythm before adding shadows.
- **Do** keep controls compact and tactile, with visible keyboard focus and reduced-motion behavior.
- **Do** use Geist Mono for paths, payloads, methods, identifiers, and measured values.
- **Do** preserve module density while keeping labels, status, and primary actions scannable.

### Don't:

- **Don't** introduce glossy SaaS gradients or broad decorative color washes.
- **Don't** use oversized marketing cards inside the operational workspace.
- **Don't** round every container into a pill or stack several large-radius boxes without structural need.
- **Don't** add decorative animation. Motion must explain state, continuity, or direct manipulation.
- **Don't** turn semantic HTTP, success, warning, or error colors into general accents.


### Global endpoint console

Administrators open the endpoint console from the dashboard header. It docks at
the bottom without blocking page navigation, and its height is adjustable from
35% to 100% of the viewport. Filters and selections remain mounted across dashboard
navigation and closing/reopening the console.

Reuse the endpoint traffic viewer for status, search, page size, timestamps,
wrapping, copy, export, and request/response inspection. Global traffic adds
searchable biller-name and endpoint path comboboxes, a separate HTTP method select, a local-time "since" input, reset, older-page navigation,
and return to latest. Biller selection narrows endpoint choices and resets the
endpoint selection. Method selection also narrows endpoint choices and resets the
endpoint selection. Biller slugs and endpoint IDs remain internal to API filtering.
Polling runs every two seconds while the console is open, auto-refresh is enabled,
and the latest page is selected. Exports contain the displayed page; global clear
is unavailable. Closing restores focus to the console button. Copy and controls
support English and Indonesian.

The global console uses a compact toolbar above the logs: inline summary and
refresh, biller/method/endpoint/date filters on one desktop row, then display,
search, and export controls. It omits the endpoint viewer's duplicate heading and
summary cards. Toolbar rows wrap on smaller screens.

The compact console includes a shadcn Menubar with View checkbox items for
auto-refresh, wrapping, and timestamps, and Export actions for text, CSV, and
Excel. Filters and search remain visible. Escape dismisses a nested popup before
closing the console.

Choice filters use compact searchable shadcn comboboxes for biller, method,
endpoint, and status. Visible field labels are removed from the console toolbar,
with accessible labels retained. Scope filters occupy their own full-width row, with status and search beneath
them. Narrower screens wrap controls. Filter popups are at least 16rem wide,
independently of the compact trigger width.

The docked console keeps its title, filter toolbar, and latest/older pagination
fixed within the panel. Only the log pane scrolls, horizontally and vertically;
it fills the height remaining below the toolbar and above pagination.

The console slides upward and fades in over 280ms, then slides down and fades
out over 200ms, using the shared ease-out curve. Reduced motion uses a 150ms
fade. Closing immediately disables interaction and polling while retaining the
viewer state; the panel hides after its exit finishes. Rapid toggles reverse
the animation from its current position.

Traffic direction uses explicit R for the received request in the info color and
S for the sent response in the success color, matching the exchange inspector.
The toolbar includes a direction legend; status remains a separate indicator.
Copied and text-exported log lines retain the R/S labels.

Traffic rows highlight the HTTP method using the shared endpoint method colors:
GET blue, POST green, PUT amber, PATCH purple, and DELETE red. Other captured
methods use a neutral fallback. Plain-text copying retains the method label.

Each exchange has two stacked lines: a blue R request line with a colored HTTP
method and request metadata, and a green S response line with HTTP status,
duration, response metadata, and body preview. Both retain the request ID for
correlation. Selection and detail inspection apply to the complete exchange.
Copied and text-exported exchanges use the same two-line format.

Inline response-body previews highlight JSON keys, strings, numbers, literals,
and punctuation using theme-aware colors. Highlighting preserves whitespace and
truncated previews and renders payloads as escaped React text. Copy and export
continue to use the original preview text.

Traffic status uses compact colored codes: SUC, ERR, DLY, EMP, TMO, and MIS.
Full localized labels remain available through accessible labels and hover titles.
Only the small status dot pulses gently; reduced motion keeps it static. The
selection/status columns are narrowed and exchange lines use tighter spacing.

The console's top edge is a draggable resize handle with a row-resize cursor and
pointer capture for mouse, pen, and touch. It shares the slider's 35–100% bounds.
Keyboard users can focus the handle and use Up/Down, Shift for larger steps, or
Home/End for the bounds. Resizing changes height directly without animation.

The console header includes Fullscreen and Restore controls. Fullscreen fills
the app viewport and Restore returns to the height used before maximizing. The
slider, draggable edge, and keyboard End key can also reach 100%.

### SFTP file browser and SSH transfers

The Termius-inspired file browser uses a fullscreen Dialog with local and remote
panes, compact toolbars, thin dividers, and the existing theme tokens. Panes sit
side by side on desktop and stack below the medium breakpoint, with file lists
scrolling inside each pane. `ADMIN` users open `/servers/:serverId/files` from
SSH or SFTP inventory details, or Browse files from the SSH terminal's Files menu.
The direct route uses a standalone SFTP connection without starting a shell.

The local pane requires an explicit Choose files or Choose folder action. Folder
selection creates virtual navigation from the chosen files; empty folders are
unavailable because the browser picker supplies files only. Explain this boundary
in the browser rather than suggesting unrestricted access to the local filesystem.

Remote navigation provides breadcrumbs, Back, Forward, Up, an editable path, and
Refresh. Both panes offer filtering, hidden-file visibility, sortable columns,
and filename, modification date, size, and kind metadata; remote rows also show
permissions. Select a file for Upload or Download; double-click or Enter opens a
folder or transfers a file. Directory listings show truncation explicitly.

Transfer one file at a time, with filename, transferred MiB, progress, and Cancel
in a compact row. Upload into the current remote directory and never overwrite
an existing file. Disable remote navigation and transfer actions while listing,
transferring, or disconnected; show connection and listing errors in the remote
pane. Keep English and Indonesian copy and visible keyboard focus.

The SSH Files menu also retains Upload file and Download file path dialogs using
the shared Dialog, Field, and Input components, plus Cancel transfer. These
dialogs explain SFTP path resolution and use the same transfer progress controls.

### Remote-session exit confirmations

SSH, RDP, and SFTP Disconnect and Back to inventory actions use a compact
AlertDialog with the server name, a transfer interruption explanation, Stay
connected, and Disconnect or Disconnect and leave. The SFTP confirmation nests
inside its fullscreen browser's Dialog context. Disconnected sessions bypass the
confirmation; returning from the browser to SSH keeps the connection open. Active
sessions register a native beforeunload warning for document navigation/closure.
The SSH inventory guide places Open terminal and Open file browser in a flex row
with an 8px gap, stacking the actions below the small breakpoint.
