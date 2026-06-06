# 02 Node Planets

## Status

`planned`

## Goal

Redraw every node on the `Карта знаний` canvas as a planet: a circular body in the sphere's `default` token, an optional ring for milestone nodes, a 1px inner stroke, and the existing node-type icon inside. The data layer is unchanged.

## Why This Matters

A planet is a strong visual metaphor for "this is a place you can be". The body color, the ring for milestones, and the icon for the type give each planet identity without overwhelming the canvas. The data layer is reused, so the interaction model is preserved.

## Scope

- the node geometry in `src/game/layers/map-layer.ts` (replacing the existing draw call with a new one that draws planets);
- the icon mapping (the existing node-type icon is rendered inside the planet body, scaled to 4-6px);
- the milestone ring (drawn around the planet body for nodes that are marked as milestones in the data model).

## Requirements

### Body

- three sizes: `small` (6px), `medium` (10px), `large` (14px);
- body fill: the sphere's `default` token;
- 1px inner stroke in white at 30% alpha;
- the body's `z-index` is above the edges (epic 47 workstream 03) and below the current-node marker (epic 43).

### Ring (milestone only)

- 1.5x the body radius, 1px stroke, sphere's `strong` token at 50% alpha;
- the ring is a thin ellipse, not a circle, to suggest an orbital plane (a 0.6 vertical scale);
- the ring rotates slowly (0.05 rad / s) around the planet body; the rotation is paused when the tab is hidden.

### Icon

- the existing node-type icon (code, math, system, etc.) is rendered inside the body, scaled to 4-6px, in white at 60% alpha;
- the icon is centered on the body;
- the icon is part of the planet component, not a separate sprite, so the hit area is the body.

## Out Of Scope

- Animating the body itself (out of scope; the body is static, the ring rotates);
- Adding a glow / corona to non-milestone planets (epic 43 already adds a corona to the current planet);
- Changing the existing node-type icon set.

## Implementation Hints

- The existing draw call likely takes a `radius` and a `color`; replace the `color` argument with the sphere token and the `radius` argument with the size enum from this epic.
- The icon is a small `<svg>` or a canvas path; keep it under 16 lines per icon to avoid bloat.
- The ring rotation can be driven by the same `performance.now()` clock as the current-node pulse (epic 43), so the two animations stay in phase.

## Done When

- Every node on the canvas is a planet with the correct size, color, and icon.
- Milestone nodes have a rotating ring.
- The data layer is unchanged: the existing interaction, hover, click, and keyboard behavior all work.
- The render loop stays under 16ms per frame on a standard laptop.
- The ring pauses when the tab is hidden.
