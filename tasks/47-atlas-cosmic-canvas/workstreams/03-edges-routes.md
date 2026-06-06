# 03 Edges Routes

## Status

`planned`

## Goal

Redraw every edge on the `Карта знаний` canvas as a jump route: a thin curved Bezier from source to target, in the source sphere's `default` token at 30% alpha, with a 2-3 pixel stardust trail that animates from source to target over 4-6 seconds and loops.

## Why This Matters

Straight lines feel like a diagram, not a journey. A curved Bezier with a stardust trail reads as "your ship will travel this route", which is the metaphor the cosmic direction is going for. The trail gives the edge life without becoming a distraction.

## Scope

- the edge geometry in `src/game/edge-geometry.ts` (replacing the existing straight-line draw with a curved Bezier);
- the stardust trail animation in `src/game/layers/map-layer.ts` (or a new `src/game/layers/jump-route-layer.ts` if the layer count is at the budget);
- the trail lifecycle (start, animate, loop) and the per-edge state needed to drive it.

## Requirements

### Curve

- a single Bezier curve from source to target, with a control point offset perpendicular to the midpoint by 20-40px in the source sphere's `default` token direction;
- the curve is 1px wide, in the source sphere's `default` token at 30% alpha;
- the curve is drawn behind the planets (workstream 02) and above the nebulae (workstream 01).

### Stardust trail

- 2-3 small dots, 1.5px radius, in the source sphere's `default` token at 50% alpha;
- the dots animate along the curve from source to target over 4-6 seconds, looped, with a 0.5s pause between loops;
- the trail is computed once per render frame from `performance.now()` (same clock as the current-node pulse, epic 43);
- the trail is paused when the tab is hidden.

### Performance

- the curve and the trail are drawn in a single canvas path / batch, not as individual sprites;
- the per-edge state is a single `Map<edgeId, { startTime: number; duration: number }>` in the layer, not a React state, to avoid re-renders on every frame.

## Out Of Scope

- Animating the curve color (out of scope; the curve is static);
- Adding arrow heads to the curve (out of scope; the source / target planets are the affordance);
- Replacing the Bezier with a different curve type (out of scope; Bezier is the brief).

## Implementation Hints

- The `edge-geometry.ts` module likely already has a `drawEdge` function; extend it with a `drawJumpRoute` variant that returns the curve points, then pass them to the layer.
- The stardust dots are drawn with a small `requestAnimationFrame` loop inside the layer's `render` method, not a separate timer.
- The trail duration is derived from the edge length (longer edges get longer durations, up to a cap of 6s).

## Done When

- Every edge on the canvas is a curved Bezier with a stardust trail.
- The trail animates smoothly and pauses when the tab is hidden.
- The render loop stays under 16ms per frame on a standard laptop.
- The data layer is unchanged: the existing interactions (hover, click, keyboard) all work.
