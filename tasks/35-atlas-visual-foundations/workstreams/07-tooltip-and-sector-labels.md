# 07 Tooltip And Sector Labels

## Status

`planned`

## Goal

Enrich the hover tooltip with mastery progress and `routeOrder`, and add sphere sector labels to the atlas backdrop.

## Why This Matters

`GameMapCanvas.tsx:1076-1109` renders the tooltip as:

- a status label;
- a `title`;
- a `subtitle`;
- an optional `nextActionTitle`.

It does not show `routeOrder` or mastery rank, even though both are present in `tooltipNode.routeSequenceIndex`, `routeCurrentMasteryRank`, and `routeRequiredMasteryLevel`. The atlas also has no sector labels, so a learner hovering over a wedge has no idea which sphere they are looking at.

## Scope

- the tooltip block in `GameMapCanvas.tsx:1076-1109`;
- a new sector label draw pass in `map-layer.ts:drawAtlasBackdrop` (around `:929-946`);
- the existing `PixelSurface` / `PixelText` imports (no new component).

## Requirements

### Tooltip

- Add a compact `routeOrder` chip when `tooltipNode.routeSequenceIndex` is present.
- Add a thin mastery bar showing `routeCurrentMasteryRank` of `6`.
- Keep the existing `nextActionTitle` placement.
- Tooltip width should not exceed `300px` and must stay inside `window.innerWidth - 24`.

### Sector labels

- For each sphere, draw the sphere title (`biome.name`) at `radius 870` along the `centerAngle`.
- Font: same as the rest of the atlas (`Trebuchet MS`).
- `fontSize 14`, `alpha 0.7`, `align center`.
- Labels must not overlap edges or nodes; if a sphere has a very large `nodeCount`, push the label outward to `radius 920`.
- Labels are read‑only and not interactive.

## Out Of Scope

- Adding new fields to the tooltip beyond mastery and `routeOrder`.
- Translating the sector names (they come from `NavigationSphere.name`).
- Adding a label search/highlight UX.

## Implementation Hints

- For the tooltip mastery bar, use a small inline `div` with a `PixelMeter` and explicit `value = (rank / 6) * 100`.
- For the sector label, create a `Text` per sphere and add it to a dedicated `Container` so it can be hidden in non‑atlas presentation.
- The label container should be re‑created on each `render` call to keep the label text in sync with the current data.

## Done When

- A hovered route node tooltip shows `#N`, mastery bar, and next action.
- Each sphere shows its name along the `centerAngle` at `zoom 0.5+`.
- Labels do not collide with nodes on `Бакалавриат по информатике` and `NLH cash` atlases.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
