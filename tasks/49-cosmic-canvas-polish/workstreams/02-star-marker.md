# 02 Star Marker

## Status

`planned`

## Goal

Make the current-node marker a 4-point star with a soft pulsing corona, not a circle. The shape, the colour, the alpha, and the pulse are exactly as the spec in the epic README says.

## Why This Matters

The first cut rendered the marker as a thick yellow circle with a double outline. The user-supplied screenshot shows the circle clearly. The spec calls for a 4-point star + corona. The star is the visual cue that says "this is the active star system" in the cosmic metaphor — a circle reads as "this node is selected", which is a different, less cosmic idea.

## Scope

- `src/game/layers/map-layer.ts` (or wherever the current-node marker is drawn). If the marker is split across multiple files (e.g. body in one, corona in another), edit all of them.
- The pulse animation. If the pulse is currently driven by a frame counter, change it to `performance.now()` per the spec.
- The visibility listener that pauses the pulse on tab hide. If it does not exist, add it.

Excludes:

- The nebulae (workstream 03 of this epic).
- The focal spiral (workstream 01 of this epic).
- The right `Занятие` panel, the minimap, the breadcrumb, the legend.

## Requirements

### Shape

- 4-point star, outer radius 14px, inner radius 6px. Vertices at 0°, 90°, 180°, 270° on the outer radius; at 45°, 135°, 225°, 315° on the inner radius.
- Drawn as a `path` with 8 vertices (or a `star` symbol if PixiJS supports it cleanly). Do not draw it as a `circle()` and a rotation — the points must come from the path.
- Star body fill: `--sphere-{slug}-strong` of the current sphere.
- Inner stroke: 1px `#FFFFFF` at 60% alpha, drawn on the inside of the path so the points stay sharp.
- Sphere slug is read from the current node's `sphereId` (or whatever field the existing data layer uses). If the slug is missing, fall back to white and `console.warn` once per session.

### Corona

- A radial gradient: 0% alpha at the outer edge, 30% alpha at the star edge, colour `--sphere-{slug}-strong`.
- Diameter 42px (so the gradient spans 21px on either side of the star centre).
- Drawn behind the star body. The star body is on top, the corona is below.

### Pulse

- Corona scale animates 0.96 → 1.04 over 2.4s, ease-in-out, looped. The curve is `ease-in-out` (slow at the ends, fast in the middle), not linear.
- The alpha of the corona breathes 0.20 → 0.30 in sync with the scale.
- Driven by `performance.now()` (not a frame counter), so frame drops do not skip the cycle.
- Paused when `document.hidden === true`. On `visibilitychange`, resumed from the current `performance.now()` (not from the paused frame, which would skip a half-cycle).
- The star body itself does not animate. Only the corona.

## Out Of Scope

- Adding new sphere colours.
- Changing the marker on non-current nodes (those stay as planets).
- Adding sound, particles, or a halo on top of the star.

## Implementation Hints

- If the existing marker is a single `circle()` call wrapped in a transform, replace it with a `path` (or `star` symbol). Do not keep the circle as a fallback.
- The pulse can be computed once per frame in the existing render loop. The existing `requestAnimationFrame` should already be in place from epic 47; do not add a second loop.
- The visibility listener is on `document`, not the canvas element. One global listener is enough.

## Done When

- The marker on the canvas is a 4-point star, not a circle. A visual screenshot is the primary evidence.
- The pulse is visible (a small breath on the corona) and pauses when the tab is hidden.
- `rg "circle\(" src/game/layers/` returns no hits in the current-node marker function (there may be hits in other parts of the file, that is fine).
- A unit test asserts the marker path has 8 vertices and the corona is a radial gradient, not a filled disc.
- `npm run lint`, `npm run test`, `npm run build` are all green.
