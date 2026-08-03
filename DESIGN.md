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
