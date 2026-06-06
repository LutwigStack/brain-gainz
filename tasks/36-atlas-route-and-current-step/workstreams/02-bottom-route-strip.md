# 02 Bottom Route Strip

## Status

`planned`

## Goal

Show the current route as a compact strip of chips at the bottom of the atlas, so the learner can see current, next, weak, and boss at a glance.

## Why This Matters

The `layout-rules.md` from epic 34 specifies a route strip in section 6, but the current `desktop-atlas-workspace.png` only has a single "selected node" card at the bottom. The learner has to open the right inspector to know "what comes after the current step", which is exactly what the layout rules were trying to avoid.

## Scope

- a new component under `src/components/` (e.g. `RouteStrip.tsx`);
- integration with `GameMapCanvas` so the strip is positioned over the canvas;
- a callback so clicking a chip dispatches a `MapCameraCommand` of type `focus-node`;
- the existing `map-camera-command.ts` module (read only — confirm `focus-node` is supported).

## Requirements

### Layout

- fixed bottom strip, full width, `~64px` tall on desktop;
- on mobile, the strip collapses into a horizontally scrollable row at the bottom of the canvas, `~48px` tall;
- sits above the bottom route strip defined in `layout-rules.md:6`.

### Chips

- show at most `7` chips: previous (faded), current, next 3‑5, weak (if any), boss (if any);
- chip variants:
  - `current`: `accent` background, bold text, leading `▶` glyph;
  - `next`: subtle background, `→` glyph;
  - `weak`: `warning` background, `⚠` glyph;
  - `boss`: `danger` background, `★` glyph;
  - `complete`: `success` background, `✓` glyph (faded);
  - `locked`: muted, `🔒` glyph.
- each chip shows the node `title` truncated to `~18` characters.

### Interaction

- clicking a chip dispatches a camera command to center on that node;
- the camera command should reuse the existing `MapCameraCommand` queue (no parallel mechanism);
- on hover, the chip shows a short tooltip with `routeOrder` and the node's `nextActionTitle` (if any).

## Out Of Scope

- Re‑ordering the route from the strip (read‑only here).
- Showing the full route (only current + window are visible).
- Drag‑and‑drop re‑ordering (separate epic if needed).

## Implementation Hints

- Reuse the `PixelSurface` and `PixelButton` components for chips.
- The strip should accept a `routeNodeMetadata` prop and a `onFocusNode` callback, mirroring the existing `GameMapCanvas` interface.
- For mobile, the strip is always visible at the bottom of the canvas (do not hide it in focus mode).

## Done When

- Desktop shows a bottom strip with current + 3‑5 next + weak + boss chips.
- Mobile shows a horizontally scrollable strip with the same data.
- Clicking a chip centers the camera on the corresponding node.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
