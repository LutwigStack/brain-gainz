# 04 Focal Anchor

## Status

`planned`

## Goal

Replace the symmetric layout of the `Карта знаний` canvas with an asymmetric spiral that places the current node at the visual focal point. No mirrored halves, no regular grid, no rotational symmetry.

## Why This Matters

A symmetric layout is what every "node graph" demo does. A focal spiral gives the canvas a sense of "you are here, the rest of the program radiates from here", which is the metaphor the cosmic direction is going for. It also makes the current node more findable - the eye lands on it first.

## Scope

- the layout function in `src/game/skill-atlas-layout.ts` (the function that places nodes around the current one);
- the new spiral algorithm (a new pure function, exported and unit-tested);
- the layout cache, if any, is updated to key on the current node id, not on the program id alone (so that switching the current node re-runs the layout).

## Requirements

### Focal point

- the current node sits at 35% from the left and 40% from the top of the canvas, regardless of the canvas size;
- the position is in canvas space, not screen space (the camera framing handles the rest).

### Spiral

- a logarithmic spiral (r = a * e^(b * theta), with b around 0.2) winds out from the focal point;
- the spiral direction is consistent per program: `Бакалавриат по информатике` uses clockwise, `NLH cash` uses counter-clockwise (this is a design call, the workstream can revisit);
- the spiral is not perfectly uniform: the angle between consecutive nodes is jittered by ±15% so it does not look mechanical;
- nodes that share an edge with the current node are placed in the inner ring; nodes that share an edge with an inner-ring node are placed in the next ring; etc.;
- the algorithm terminates after all nodes are placed; if the canvas is too small to fit the spiral, the outer nodes are clipped (the camera framing handles the visible portion).

### No symmetry

- the spiral has no mirror axis; a vertical line through the focal point does not produce two equal halves;
- the spiral has no rotational symmetry; rotating the canvas by 90° does not produce a similar layout;
- the layout is deterministic per program (the same program always produces the same spiral), but it is not the same for two different programs.

## Out Of Scope

- Animating the layout on focus change (out of scope; the layout snaps to the new position, no transition);
- A 3D layout (out of scope; the canvas is 2D);
- A user-configurable spiral direction (out of scope; the direction is per-program, hard-coded in the catalog).

## Implementation Hints

- The `skill-atlas-layout.ts` module already has a layout function; replace it with the new spiral function. The function signature should not change, so the rest of the code keeps working.
- The spiral can be implemented in 50-80 lines; do not pull in a graph-layout library for this.
- The unit test asserts that for a fixed program and a fixed current node, the layout is the same across runs (deterministic) and that the focal point is at the expected position.

## Done When

- The current node is at the visual focal point (35% from the left, 40% from the top).
- The rest of the nodes are arranged in a logarithmic spiral around the focal point.
- The layout is not symmetric (no mirror, no rotation).
- The layout is deterministic per program.
- The existing camera framing still works.
- The unit test for the layout passes.
