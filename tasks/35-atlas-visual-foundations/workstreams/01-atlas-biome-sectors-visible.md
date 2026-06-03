# 01 Atlas Biome Sectors Visible

## Status

`done`

## Goal

Make every sphere's biome sector readable on the atlas background.

## Why This Matters

In `map-layer.ts:921-940` (`drawAtlasSectorWedge` and `drawAtlasBackdrop`) the wedge fill is drawn with `alpha: 0` and the wedge stroke is set to `alpha 0.045`. On the actual desktop screenshot the colored sectors are not visible at all. The atlas feels empty in the inter‑node space and the learner cannot visually anchor which nodes belong to which sphere.

## Scope

- `drawAtlasSectorWedge` in `map-layer.ts`;
- `drawAtlasBackdrop` in `map-layer.ts`;
- the biome palette in `createBiome` (`create-game-view-model.ts:90-106`) — read only, do not change palette values.

## Requirements

- Each sphere must show a colored wedge from `innerRadius` to `outerRadius`.
- Wedge `fill` alpha: `0.06-0.10` (tunable per density).
- Wedge `stroke` alpha: `0.18-0.22` along the inner arc.
- Add a low‑alpha outer rim stroke (similar to the `structure_root` glow pattern) to separate the sphere from neighbors.
- Sectors must not occlude edges or nodes.
- Color must come from `biome.color` / `biome.accent`, not new constants.

## Out Of Scope

- Changing biome palette colors.
- Adding labels inside the wedge (handled in workstream 07).
- Changing layout of nodes inside the wedge (handled in workstream 02).

## Implementation Hints

- Move from `alpha: 0` to `alpha: 0.07` for the wedge fill.
- Replace single `stroke width: 1, alpha: 0.045` with a two‑pass: inner arc at `alpha 0.2`, outer arc at `alpha 0.12`.
- Sectors are drawn before edges and nodes, so the existing `world.addChild` order in `MapLayer` already supports this — only the alpha values change.

## Done When

- On `desktop 1280x900`, every sphere sector is visible without zooming.
- Edges and nodes still render above the sectors.
- No visual regression on the `graph` (non‑atlas) presentation.
- Visual test screenshot stored under `qa/`.
