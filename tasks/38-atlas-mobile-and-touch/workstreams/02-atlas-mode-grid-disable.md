# 02 Atlas Mode Grid Disable

## Status

`planned`

## Goal

Stop the default `effects-layer` grid from competing with the atlas rings.

## Why This Matters

`EffectsLayer.render` in `effects-layer.ts:30-60` always draws a grid using `GRID_SIZE` and `GRID_MAJOR_STEP`. The radii of this grid are not aligned with the atlas rings (`180/260/500/720/900` in `map-layer.ts:942-945`). On `desktop-atlas-workspace.png` the two radial rhythms create a slight moiré and confuse the eye.

> Note: most of the starfield and grid cleanup lives in epic 35 workstream 06. This workstream is the small, mobile‑focused piece that ensures the grid does not show up at all on mobile (where the canvas is smaller and any extra visual noise hurts more).

## Scope

- `EffectsLayer.render` in `effects-layer.ts`;
- the `presentation` prop wiring in `BrainGainzScene` (read only — confirm it is forwarded).

## Requirements

- In atlas mode (`presentation === 'skill-atlas'`), the default grid lines must be suppressed entirely.
- In `graph` (non‑atlas) mode, the grid stays.
- The starfield pass is unchanged (handled by epic 35 workstream 06 separately).

## Out Of Scope

- Replacing the grid with an aligned version (epic 35 workstream 06).
- Adding a per‑sphere grid variant.
- Animating grid lines.

## Implementation Hints

- Add an early return in the grid loop in `EffectsLayer.render` when `model.presentation` (or the passed prop) is `'skill-atlas'`.
- If the prop is not currently forwarded, add a `presentation` parameter to `EffectsLayer.render` and pass it from `BrainGainzScene.render:160`.

## Done When

- In atlas mode, no `effects-layer` grid lines are rendered.
- In `graph` mode, the grid is still rendered.
- No visual regression elsewhere.
- Visual test screenshot stored under `qa/`.
