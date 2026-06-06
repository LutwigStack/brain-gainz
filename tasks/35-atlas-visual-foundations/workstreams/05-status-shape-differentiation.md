# 05 Status Shape Differentiation

## Status

`planned`

## Goal

Distinguish node states by both shape and color, so the atlas is readable for color‑blind learners and at small zooms.

## Why This Matters

In `map-layer.ts:1126-1138` every status badge (`weak`, `contested`, `verified`, `locked`) is drawn as the same `circle` shape, just at a different position. The radius is `Math.max(4, radius * 0.18)`, which on an `atomic_node` (`size 24`) is `~4px`. At that size only color carries information, and several status colors are similar (yellow `weak` and yellow `current`).

## Scope

- the status badge block in `drawAtlasNode` (`map-layer.ts:1126-1138`);
- the corresponding state palette mapping (additive — keep existing color logic intact).

## Requirements

- Use distinct shapes per status:
  - `weak` -> triangle (point up);
  - `contested` / `lost` -> diamond (rotated square);
  - `verified` / `completed` -> check mark glyph;
  - `locked` -> square (rotated 0°);
  - `current` keeps the round pulse;
  - `boss` keeps its existing spike ring.
- Keep the existing color logic for each status.
- Badge size must scale with the node `radius` (current rule), with a hard minimum of `4px` for visibility.
- Badge must not overflow the node shell.

## Out Of Scope

- Changing the color palette.
- Changing the `current` pulse animation.
- Adding tooltips or sound feedback on hover.

## Implementation Hints

- For each shape, draw directly on the same `Graphics` `shell` inside `drawAtlasNode`:
  - triangle: `poly([...])` then `fill({ color, alpha })`;
  - diamond: `poly([...])` with four points rotated 45°;
  - check mark: a polyline of three points;
  - square: `rect(...)` then `fill`.
- All shapes are anchored to the same `(radius * 0.52, -radius * 0.5)` offset.
- Keep the existing fallback to the round circle for unhandled states.

## Done When

- At `zoom 1.0` on a `Бакалавриат по информатике` atlas, the four states `weak`, `contested`, `verified`, `locked` are distinguishable by shape alone (verified by screenshot review).
- No new test regressions in `tests/skill-atlas-layout.test.js` or `tests/game-view-model.test.js`.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
