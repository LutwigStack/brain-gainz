# 03 Knowledge Graph Edge Contrast

## Status

`planned`

## Goal

Make the graph edges in `skill-atlas` mode readable as a knowledge topology, not as faint decoration.

## Why This Matters

In `map-layer.ts:497-505` and `:536-548` atlas edges are drawn with very low contrast:

- `local_cluster` `atlasWidth: 0.55`, `atlasAlpha: 0.08`;
- `structure_root` `atlasWidth: 1.15`, `atlasAlpha: 0.16`;
- `structure_branch` `atlasWidth: 1`, `atlasAlpha: 0.14`.

At `zoom 0.5` on a `1280x900` desktop view, the baseline graph is barely visible. The atlas reads as a tree of disconnected node clusters, which contradicts the `knowledge graph` framing.

## Scope

- `drawEdges` in `map-layer.ts` (`map-layer.ts:452-711`);
- the `atlasWidth` / `atlasAlpha` tables inside that function;
- the existing `focusBoost` constant for `isCurrentRouteTarget` edges.

## Requirements

- `local_cluster` `atlasAlpha` must rise to `0.16-0.22` and `atlasWidth` to `0.85`.
- `structure_root` and `structure_branch` edges must add a low‑alpha glow pass (mirroring the existing `structure_root` two‑stroke pattern).
- `isOnSelectedPath` edges must get a `selectedAlpha` boost (e.g. `+0.08`) so the focused path is visually dominant.
- `route_overlay` edges keep their existing dotted/solid contrast.
- Edges must still not occlude nodes or sector wedges.

## Out Of Scope

- Changing the underlying `bendStrength` or `createQuadraticRoute` parameters.
- Changing edge colors (semantic colors stay in `graph-edge-semantics.ts`).
- Changing edge patterns (`solid` / `glow` / `dotted`).

## Implementation Hints

- For `structure_root` and `structure_branch`, follow the same two‑pass pattern already used in `map-layer.ts:551-562`:
  - first pass: thicker stroke at very low alpha for halo;
  - second pass: regular stroke at the current alpha.
- For `local_cluster`, simply update the alpha/width constants at the top of the atlas branch.
- For the `isOnSelectedPath` boost, use `fromNode.isOnSelectedPath && toNode.isOnSelectedPath` (already computed as `isSelectedPathEdge`) and add the boost on top of the existing alpha.

## Done When

- The baseline graph is visible at `zoom 0.5` on desktop without zooming in.
- The selected path reads as brighter than the rest of the graph.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
