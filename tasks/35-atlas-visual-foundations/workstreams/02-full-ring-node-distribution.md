# 02 Full Ring Node Distribution

## Status

`done`

## Goal

Make every sphere fill its allocated ring with nodes, instead of collapsing them into a half‑moon arc.

## Why This Matters

In `skill-atlas-layout.ts:236-243` the helper `distributeAngle` pads the available span by up to `0.22` radians on each side. Combined with `COURSE_DENSE_MAX_SPAN = Math.PI * 0.68` (`skill-atlas-layout.ts:175-178`), the course and topic nodes for a sphere end up distributed on roughly a 120° arc while the rest of the ring is empty. The atlas visually breaks into four half‑moons, which fights the radial skill‑tree reading.

## Scope

- `distributeAngle` in `skill-atlas-layout.ts`;
- `COURSE_DENSE_MAX_ANGLE_STEP` and `COURSE_DENSE_MAX_SPAN` constants in `skill-atlas-layout.ts`;
- any layout tests under `tests/skill-atlas-layout.test.js` that pin angle behavior.

## Requirements

- The default padding inside a sphere ring must drop from `0.22` to `0.05` radians.
- `COURSE_DENSE_MAX_SPAN` must rise from `Math.PI * 0.68` to `Math.PI * 1.4`.
- For branches with `>= 6` children, the inner cluster keeps a tighter radial spread, not a tighter angular spread.
- The root node and program hub stay centered.
- Sector gutter (`SECTOR_GUTTER = 0.035`) stays as‑is to keep visual separation between adjacent spheres.

## Out Of Scope

- Changing `DOMAIN_RING_RADIUS`, `COURSE_RING_RADIUS`, `TOPIC_RING_RADIUS` radii.
- Changing the inner cluster radius for atomic nodes.
- Changing topic ring radius for clusters with `>= 6` children.

## Implementation Hints

- Replace `const padding = Math.min((endAngle - startAngle) * 0.18, 0.22);` with `const padding = Math.min((endAngle - startAngle) * 0.05, 0.05);`.
- Update `COURSE_DENSE_MAX_SPAN` to `Math.PI * 1.4`.
- Keep the existing `if (total <= 1)` guard.
- Re‑export updated constants if any test imports them.

## Done When

- Each sphere ring is filled to at least 70% of its full angular span.
- Course hubs are no longer pinned to a single quadrant of the ring.
- Layout tests still pass.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
