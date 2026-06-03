# 01 Touch Hit Areas

## Status

`planned`

## Goal

Expand the touch hit area for atlas nodes so a finger can reliably select any node type on mobile.

## Why This Matters

`drawAtlasNode` in `map-layer.ts:1090-1096` sets the `hitArea` to:

```ts
new Rectangle(
  -radius - NODE_HIT_PADDING,
  -radius - NODE_HIT_PADDING,
  size + NODE_HIT_PADDING * 2,
  size + NODE_HIT_PADDING * 2,
)
```

`NODE_HIT_PADDING = 16`, so for `atomic_node` (`size 24`) the hit area is `24 + 32 = 56px` square, centered on the node. In practice the node itself is only 24px, so the learner has to tap inside a 24px circle. That is below the 32‑40px minimum recommended for mobile UI.

## Scope

- `NODE_HIT_PADDING` in `map-layer.ts`;
- the `hitArea` assignment in `drawAtlasNode` (`map-layer.ts:1090-1096`);
- the `findNodeHitAtScreenPoint` fallback in `brain-gainz-scene.ts:860-938`;
- the `GameMapCanvas.resolveCanvasHit` fallback in `GameMapCanvas.tsx:673-746`.

## Requirements

- For atlas mode, the hit area radius must be at least `16px` for `atomic_node`, `22px` for `topic_node`, `30px` for `course_hub`, `36px` for `domain_hub`, `42px` for `root`.
- The expanded hit area must not overlap a sibling node by more than `4px` on a typical sphere ring; if it does, the closer node wins (existing distance sort in `findNodeHitAtScreenPoint` handles this).
- In `graph` (non‑atlas) mode, the existing `NODE_HIT_PADDING = 16` rule is kept.
- The expansion must apply to both the Pixi `hitArea` and the `resolveCanvasHit` JS fallback.

## Out Of Scope

- Increasing the visual size of nodes (the hit area is invisible).
- Adding long‑press or double‑tap gestures.
- Changes to the `createMode` flow.

## Implementation Hints

- Introduce a per‑type hit radius table in `map-layer.ts` (mirroring `ATLAS_NODE_SIZE`).
- In `drawAtlasNode`, use the per‑type radius to compute the hit area, ignoring `NODE_HIT_PADDING` in atlas mode.
- In `brain-gainz-scene.ts:860-938`, compute `nodeHitPadding` from the same per‑type table.
- In `GameMapCanvas.tsx:673-746`, the existing `nodeHitPadding` line should also use the per‑type table.

## Done When

- Touch hit areas meet the minimums in `README.md` for every atlas node type.
- A finger tap on the periphery of a `topic_node` (within `~22px` of its center) selects the node.
- No regression in `graph` mode hit areas.
- Visual test screenshot stored under `qa/`.
