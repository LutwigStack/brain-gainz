# 06 Constellation Backdrop Polish

## Status

`planned`

## Goal

Make the starfield and grid backdrop support the atlas instead of competing with it.

## Why This Matters

`EffectsLayer` in `effects-layer.ts:19-62` draws:

- 56 stars positioned via `index * 137 % width` and `index * 83 % height`;
- a uniform grid using `GRID_SIZE` and `GRID_MAJOR_STEP` regardless of `presentation`.

On resize the stars move to new positions because the modulus changes. On `desktop-atlas-workspace.png` they read as noise, not as a constellation. The grid uses radii that are not aligned with the atlas rings (`180/260/500/720/900`), so the eye sees two competing radial rhythms.

## Scope

- `EffectsLayer.render` in `effects-layer.ts`;
- the `presentation` prop in `BrainGainzScene.render` (read only — confirm it is forwarded).

## Requirements

### Stars

- Star positions must be deterministic for a given `(width, height, biomeCount)` triple, so resize does not shuffle them.
- Use a seeded PRNG (e.g. mulberry32) keyed by `biome.id` so each sphere gets a recognizable cluster of stars in its sector.
- Vary star color slightly per `biome.accent` to reinforce sphere identity.
- Total star count: keep the spirit of `~56` but allow density to scale with `model.bounds` area.

### Grid

- When `presentation === 'skill-atlas'`, the default `effects-layer` grid must be either:
  - disabled, **or**
  - aligned to atlas radii (`180/260/500/720/900`) with `alpha 0.06-0.10`.
- In `graph` presentation, keep the current grid behavior.
- The decision rule must live in `EffectsLayer` (or a new prop) — do not require the caller to disable the layer manually.

## Out Of Scope

- Replacing PixiJS with a different renderer.
- Adding animations to stars or grid.
- Adding per‑biome background scenes (separate epic if needed).

## Implementation Hints

- For deterministic stars, build a small `mulberry32(seed)` and use it to generate `(x, y, radius, alpha)` once per render.
- For the grid alignment, check `map-layer.ts:942-945` for the existing constant set of `[180, 260, 500, 720, 900]`. If you keep a grid in atlas mode, reuse that list.
- Pass `presentation` from `BrainGainzScene.render` to `EffectsLayer.render` if it is not already wired.

## Done When

- Resizing the browser window does not move stars.
- Each sphere sector has a faint star cluster tied to its `biome.id`.
- In `skill-atlas` mode, the grid is either invisible or aligned with atlas rings.
- Visual test screenshot stored under `qa/`.
