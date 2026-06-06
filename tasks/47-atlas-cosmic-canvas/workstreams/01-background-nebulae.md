# 01 Background Nebulae

## Status

`planned`

## Goal

Add a deep-space background layer to the `Карта знаний` canvas: a base color and eight tinted nebulae, one per sphere, positioned to roughly match the centroid of the sphere's nodes. A faint star field is added for texture.

## Why This Matters

The cosmic direction is the entire reason for this epic. Without a deep-space background, the planets and jump routes would float on a navy panel and the metaphor would not land. The nebulae give the eye a place to rest between the planets and tell the learner at a glance which sphere is where.

## Scope

- the new `--cosmic-base` token in `src/theme/galaxy/` (or the existing `src/theme/pixel/tokens.ts` if the cosmic theme has not been split out);
- a new `src/game/layers/nebula-layer.ts` (or an extension of `src/game/layers/map-layer.ts` if the layer count is already at the budget);
- the star field generator (a small pure function that lays out 200-300 dots deterministically per program).

## Requirements

### Base color

- `--cosmic-base` lands around `hsl(220 30% 6%)` (very dark navy, near black);
- the value is picked so that the sphere `default` tokens stay readable on top (contrast > 4.5:1);
- the value is recorded in the token file with a short comment that names the hue, saturation, and lightness.

### Nebulae

- one nebula per sphere, positioned at the centroid of the sphere's nodes (same transform as the minimap, epic 46);
- 240-320px diameter, sized so that the largest nebula is about 25% of the canvas width on desktop;
- fill: the sphere's `soft` token at 15-20% alpha, rendered as a radial gradient that fades to `--cosmic-base` at the edge;
- the nebula is drawn before the edges, so the edges sit on top.

### Star field

- 200-300 dots, 1-2px in radius, color `--text-subtle` at 50% alpha;
- the dot positions are computed once per program slug (the same slug used by the sphere tokens, epic 41) and memoised in a module-level `Map<slug, Dot[]>`;
- the star field is drawn before the nebulae, so the nebulae tint the stars.

## Out Of Scope

- Animating the nebulae (out of scope; the background is static);
- Animating the stars (twinkle effect; out of scope);
- Adding constellations or other astronomical decoration (out of scope).

## Implementation Hints

- Use the same deterministic seed algorithm as the sphere card mini-preview (epic 42) and the minimap (epic 46), so the visual feel is consistent.
- The nebula layer is its own `Layer` subclass (or its own render function in `map-layer.ts`), with the same lifecycle (`mount`, `render(model)`, `unmount`) as the existing layers.
- The star field is a single `<canvas>` draw call per render, not 300 individual sprites.

## Done When

- The canvas background is a deep-space field with eight tinted nebulae and a faint star field.
- The nebula colors match the sphere tokens from epic 41.
- The star field is the same across reloads for the same program.
- No `console.warn` or `console.error` from the new layer.
- The render loop stays under 16ms per frame on a standard laptop.
