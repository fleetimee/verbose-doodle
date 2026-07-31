# Recharts 3.8.1 → 3.10.1 upgrade research

Date: 2026-07-31  
Repository: `biller-simulator-json`  
Scope: research and implementation validation. Recharts was updated to `3.10.1`; no application source changes were needed.

## Result

Recharts `3.10.1` is applied as a low-risk minor update. The official 3.9.x and 3.10.x release notes do not announce a breaking-change migration for this range. The main compatibility risks are behavior-level: Legend positioning defaults/API deprecations, the existing `Cell` deprecation, and a 3.10.1 fix that directly affects the repository’s labeled Pie chart.

## Repository compatibility

The frontend now declares and locks Recharts `3.10.1`, alongside React/React DOM `19.2.8`, Vite `8.0.16`, and TypeScript `7.0.2`. Vite manually places `recharts` in a `charts` chunk. The chart code uses:

- `ResponsiveContainer` with `initialDimension={{ width: 1, height: 1 }}` in [`src/components/ui/chart.tsx`](../src/components/ui/chart.tsx).
- `AreaChart`, `BarChart`, `LineChart`, and `PieChart`; `Area`, `Bar`, `Line`, `Pie`, `Label`, `LabelList`, `Cell`, `CartesianGrid`, `XAxis`, `YAxis`, `Tooltip`, and `Legend` in the overview feature.
- `accessibilityLayer`, custom Tooltip content/formatters/cursors, custom Legend content, vertical BarChart layouts, Pie `innerRadius`/`outerRadius`, SVG `Label` content, and `type`/`radius` props.

No code uses Legend `align`, Legend `verticalAlign` as a component prop, `position`, `maxBarSize`, `allowDuplicatedCategory={false}`, or Recharts animation customization props. The `verticalAlign` read by `ChartLegendContent` is used only to choose local CSS padding for the custom content.

## Release and API findings

### 3.9.x

Recharts 3.9 introduced fully customizable animations, exposed chart-layout hooks/types, HTML attribute passthrough on `ResponsiveContainer`, and a `dataKey` in PieChart Legend payloads. Its fixes include tooltip falsy-name handling, bar rendering, Legend resize behavior, and Tooltip type propagation. These APIs are additive and are not used by this repository. ([3.9.0 release](https://github.com/recharts/recharts/releases/tag/v3.9.0), [3.9.1 release](https://github.com/recharts/recharts/releases/tag/v3.9.1), [3.9.2 release](https://github.com/recharts/recharts/releases/tag/v3.9.2))

The 3.9.2 notes clarify that custom labels and ticks must return SVG elements. The repository’s custom Pie label returns `<text>`/`<tspan>`, so it already follows that requirement.

### 3.10.0

Legend gained `position` and `offset`. The release notes describe these as replacing the older `align` and `verticalAlign` positioning model. The 3.10.1 type definitions retain the old props but mark `verticalAlign` deprecated and document `position` as the preferred API; `layout` also gains the `auto` value and defaults to `auto`. ([3.10.0 release](https://github.com/recharts/recharts/releases/tag/v3.10.0), [3.10.1 Legend source](https://github.com/recharts/recharts/blob/v3.10.1/src/component/Legend.tsx))

This app does not pass those positioning props, and the new default resolves to a horizontal legend when no position is supplied. No source change is indicated for this upgrade, but any future Legend positioning should use `position`/`offset` rather than adding `align`/`verticalAlign`.

### 3.10.1

The patch release contains three relevant fixes:

- Pie now passes computed `innerRadius`/`outerRadius` to Label children. This directly touches [`user-status-chart.tsx`](../src/features/overview/components/user-status-chart.tsx), which renders a custom centered Label inside a Pie with both radii set. Expect a possible visual correction and verify the percentage label placement.
- Tooltip falls back to index-based lookup when label lookup is undefined for `allowDuplicatedCategory={false}`. The repository does not use that prop.
- Bar gap calculation is corrected when `maxBarSize` clamps width. The repository does not use `maxBarSize`.

([3.10.1 release](https://github.com/recharts/recharts/releases/tag/v3.10.1))

## React 19 and dependency compatibility

The official package metadata for both 3.8.1 and 3.10.1 declares the same consumer peer ranges: React, React DOM, and `react-is` versions `^16.8.0 || ^17.0.0 || ^18.0.0 || ^19.0.0`. React `19.2.8` therefore satisfies Recharts 3.10.1. The package’s own development dependencies use React 18, but that does not narrow its published consumer peer range. ([3.8.1 package metadata](https://registry.npmjs.org/recharts/3.8.1), [3.10.1 package metadata](https://registry.npmjs.org/recharts/3.10.1))

The runtime dependency set is otherwise compatible with the existing Vite app. Between these versions, the notable transitive changes are `immer` moving from `^10.1.1` to `^11.1.8` and `reselect` from `5.1.1` to `5.2.0`; the peer ranges and the main chart dependencies remain compatible. Updating the lockfile will be required when the implementation is authorized.

The 3.10.1 package still publishes an ES module entry (`es6/index.js`), CommonJS entry, TypeScript declarations, and `sideEffects: false`; it has no Vite-specific setup requirement. That matches the repository’s Vite module resolution and existing manual `recharts` chunk configuration. ([3.10.1 package metadata](https://registry.npmjs.org/recharts/3.10.1), [`package.json`](../package.json), [`vite.config.ts`](../vite.config.ts))

## Existing API debt

`Cell` was deprecated in Recharts 3.7 and is documented for removal in Recharts 4.0. This repository uses `Cell` in the HTTP method, endpoint status, and endpoints-by-biller charts. It is not a 3.10.1 breaking change, but it should be tracked as a separate migration to each chart element’s `shape` or `content` API before a future major upgrade. ([3.7.0 release](https://github.com/recharts/recharts/releases/tag/v3.7.0), [3.10.1 Cell declaration](https://github.com/recharts/recharts/blob/v3.10.1/src/component/Cell.tsx))

## Validation

The implementation changed only `package.json` and `bun.lock`. Validation completed with:

1. `bun install --frozen-lockfile` passed.
2. `bun run type-check` passed.
3. `bun run build` passed, and the generated `charts` chunk remains present.
4. `bun run lint` passed.
5. `bun test src/features/endpoints/utils/endpoint-metrics.test.ts src/features/endpoints/components/endpoint-detail-layout.test.tsx` passed with 8 tests and 0 failures.

A manual visual check of the user-status Pie label, both Legend-bearing charts, Tooltip rendering, vertical status/biller bars, and responsive resizing remains recommended.

### Sources

All external sources used in this report are first-party Recharts release pages, source files, official API documentation/package metadata, or repository files.
