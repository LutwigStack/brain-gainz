# 01 Focal Spiral

## Status

`planned`

## Goal

Make the canvas read as a focal spiral: current node at exactly 35% from the left and 40% from the top, the rest of the nodes laid out on a logarithmic spiral with angle jitter, no two nodes within 18px of each other. Deterministic per program.

## Why This Matters

The first cut of epic 47 placed the current node in the upper-left corner of the canvas and the rest of the nodes scattered in a way that crosses edges and packs them too tight. The screenshot `C:\Users\Andr3y\.mavis\uploads\1780747710966-image.png` shows the result: a tangle, not a spiral. The fix is a single function — the polar-to-canvas coordinate mapping in `src/game/skill-atlas-layout.ts` (or wherever it lives after the workstream 04 of epic 47 refactor).

## Scope

- `src/game/skill-atlas-layout.ts` (or equivalent) — the polar-to-canvas mapping.
- Any helper that decides "ring index" for each node from the graph topology (neighbours of current → ring 0, neighbours of ring 0 → ring 1, etc.). The graph topology itself is read-only.
- A new unit test under `tests/`.

Excludes:

- The graph topology (which nodes connect to which) — unchanged.
- The edge rendering (workstream 03 of epic 47) — auto-recomputes from new positions.
- The star marker (workstream 02 of this epic) — separate workstream.

## Requirements

### Focal point

- Current node in canvas coordinates: `x = 0.35 * canvasWidth`, `y = 0.40 * canvasHeight`. This is canvas space, not screen space; the camera framing handles the rest.
- Canvas dimensions are read from the host element at layout time. If the canvas size is not yet known when the layout runs, fall back to the most recent known size; do not crash.

### Spiral

- Polar coordinates: `r(theta) = a * e^(0.2 * theta)`, where `theta` is the angle in radians, accumulated as the layout walks the graph.
- `a` is a constant chosen so the inner ring is at roughly 60-80px from the focal point. The exact value is decided in the workstream by trial; a value of 70 is a reasonable starting point.
- Angle jitter: each node's `theta` is multiplied by `1 + uniform(-0.15, 0.15)`. The jitter is deterministic per node — seeded by the node id, not by `Math.random()`.
- Spiral direction is consistent per program: `Бакалавриат по информатике` clockwise, `NLH cash` counter-clockwise. The direction is hard-coded in the catalog lookup, not a runtime parameter.
- The walk order: ring 0 = direct neighbours of the current node (BFS depth 1); ring 1 = neighbours of ring-0 nodes (BFS depth 2) not already in a lower ring; etc. The walk within a ring is the order returned by BFS — it does not need to be sorted by node id.

### Ring size

- Ring 0 (inner): node size `large` (14px diameter).
- Rings 1 and 2: node size `medium` (10px diameter).
- Ring 3 and beyond: node size `small` (6px diameter).
- The node size is passed to the render layer via a new `ring` field on the node position object, or by re-using the existing `node.size` field if the type already supports it.

### Overlap avoidance

- After all nodes are placed, walk the position list. If any two nodes are within 18px of each other (centre-to-centre), bump the later one outward by half a turn: `theta += π`. Repeat until the resolution or a hard cap of 5 bumps per node. If 5 bumps do not resolve the conflict, log a `console.warn` with the two node ids and skip the bump.
- The 18px threshold is the diameter of the largest node (14px) plus 4px padding. Hard-code 18 in this workstream.

### Determinism

- The layout function takes the program slug and the current node id, and returns a `Map<nodeId, {x, y, ring}>`.
- The same inputs always return the same output. No `Date.now()`, no `Math.random()`, no `performance.now()` inside the layout function.

## Out Of Scope

- Changing the graph topology.
- Drawing the marker (workstream 02 of this epic).
- Drawing the edges — the edge layer reads node positions at draw time and re-derives curves.

## Implementation Hints

- The existing `skill-atlas-layout.ts` likely already returns a map of node positions. The workstream is to rewrite the polar-to-canvas part of that function. The data structure of the return value can stay the same, with the optional `ring` field added.
- For the BFS walk, use a queue (FIFO). The ring index is the BFS depth.
- For the jitter, use a small PRNG seeded by node id (the same PRNG used in the sphere card mini-preview, epic 42 workstream 01).
- The test should assert:
  - the current node is at `(0.35 * W, 0.40 * H)` for a few `W, H` pairs;
  - two consecutive runs return identical positions;
  - for a synthetic graph of 30 nodes, no two nodes are within 18px.

## Done When

- The unit test passes.
- `npm run lint`, `npm run test`, `npm run build` are all green.
- A worker (or the user) takes a screenshot of `Обзор карты` → `Карта знаний` on a fresh dev server. The current node is at roughly 35% from the left and 40% from the top of the canvas. The rest of the nodes fan out in a non-symmetric, non-overlapping pattern.
