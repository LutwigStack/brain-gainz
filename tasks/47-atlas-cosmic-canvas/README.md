# 47 Atlas Cosmic Canvas

## Status

`planned`

## Goal

Redraw the `Карта знаний` canvas as a cosmic scene: deep-space background with eight tinted nebulae, planets and orbital stations instead of generic nodes, jump routes instead of straight lines, and a clear focal anchor at the current node (no symmetric placement). The node data and the existing interaction model are not changed - only the visual layer.

## Why This Epic Exists

The user has confirmed the cosmic direction (the winning candidate from the five style options was the "Cosmic / Galactic Strategy" mockup, `tasks/47-atlas-cosmic-canvas/references/style-5-cosmic.png`). The current canvas is a generic node graph; it does not match the metaphor the rest of the app is moving to. This epic is the visual payoff for all the work in epics 40-46.

## Product Direction

- the canvas background is a deep-space field (`--cosmic-base`) with eight soft nebulae, one per sphere, tinted with the sphere's `soft` token (epic 41);
- nodes are redrawn as planet systems: a central body in the sphere's `default` token, an optional thin ring for milestone nodes, a small icon inside the body for the node type;
- edges are redrawn as jump routes: a thin curved line in the sphere's `default` token at 30% alpha, with a 2-3 pixel stardust trail that animates left-to-right at a slow pace;
- the layout is not symmetric: the current node sits at the visual focal point, and the rest of the nodes are arranged in an asymmetric spiral around it (no mirrored halves, no regular grid);
- the layer order is: background nebulae, edges, planets, current-node marker (epic 43), breadcrumb, HUD;
- the existing keyboard navigation, hover, and click behavior are preserved.

## Visual Targets

### Background

- `--cosmic-base`: a very dark navy / near-black, around `hsl(220 30% 6%)`;
- eight nebulae, each 240-320px diameter, positioned to roughly match the centroid of the sphere's nodes (the same transform used by the minimap, epic 46);
- nebula fill: the sphere's `soft` token at 15-20% alpha, rendered as a radial gradient;
- a faint star field (200-300 dots) at 1-2px in `--text-subtle` for texture.

### Planets

- three sizes: `small` (6px), `medium` (10px), `large` (14px);
- `large` planets are milestone nodes; they get a thin ring at 1.5x the body radius in the sphere's `strong` token;
- the body fill is the sphere's `default` token;
- a 1px inner stroke in white at 30% alpha to read against the background;
- an icon (4-6px) inside the body, in white at 60% alpha; the icon is the existing node-type icon (code, math, etc.) so the data layer is unchanged.

### Edges

- a thin curved Bezier from source to target, 1px wide, in the source sphere's `default` token at 30% alpha;
- a stardust trail of 3-4 small dots in the same color at 50% alpha, animating from source to target over 4-6s, looped;
- edges are layered behind the planets.

### Focal anchor

- the current node sits at the visual focal point, slightly above and to the left of the canvas center (about 35% from the left, 40% from the top), so the eye lands on it first;
- the rest of the nodes are arranged in a spiral around it, with the closest neighbours denser and the furthest sparser;
- there is no mirrored half, no regular grid, no rotational symmetry;
- the spiral direction (clockwise / counter-clockwise) is consistent per program but not per session (it can be the same for `NLH cash` and `Бакалавриат по информатике` if that feels right; the workstream records the decision).

## Scope

Includes:

- the new background layer in `src/game/layers/map-layer.ts` (or a new `src/game/layers/nebula-layer.ts` if the layer count helps);
- the new planet rendering in `src/game/layers/map-layer.ts` (replacing the existing node geometry, keeping the data layer intact);
- the new edge rendering in `src/game/edge-geometry.ts`;
- the new focal layout in `src/game/skill-atlas-layout.ts` (the function that lays out the nodes around the current one);
- the `tailwind` config (or equivalent theme module) for the new `--cosmic-base` token.

Excludes:

- The data model (nodes, edges, sphere) - unchanged;
- The right `Занятие` panel (epic 44);
- The minimap (epic 46);
- The `Обзор карты` workspace chrome (epic 39; the layout outside the canvas is unchanged);
- Renaming the `skill-atlas-layout.ts` file (parked; this is a future consolidation pass and is not part of any numbered epic yet);
- Replacing the canvas with a 3D engine (out of scope).

## Success Criteria

- The canvas background is a deep-space field with eight tinted nebulae.
- The nodes are planets (three sizes, optional ring, inner icon).
- The edges are jump routes (curved line + stardust trail).
- The current node sits at the visual focal point and the layout is not symmetric.
- The existing keyboard navigation, hover, and click behavior still work.
- The frame rate stays above 55fps on a standard laptop with the stardust trails running.
- No regression in the minimap, the breadcrumb, or the right panel.

## Workstreams

- `planned` - [workstreams/01-background-nebulae.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/47-atlas-cosmic-canvas/workstreams/01-background-nebulae.md)
- `planned` - [workstreams/02-node-planets.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/47-atlas-cosmic-canvas/workstreams/02-node-planets.md)
- `planned` - [workstreams/03-edges-routes.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/47-atlas-cosmic-canvas/workstreams/03-edges-routes.md)
- `planned` - [workstreams/04-focal-anchor.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/47-atlas-cosmic-canvas/workstreams/04-focal-anchor.md)
- `planned` - [workstreams/05-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/47-atlas-cosmic-canvas/workstreams/05-verify.md)

## Suggested Sequence

1. Add the background nebula layer.
2. Redraw the nodes as planets (keep the data layer intact).
3. Redraw the edges as jump routes.
4. Replace the symmetric layout with a focal spiral.
5. Verify visually and via a performance test.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900` and mobile `390x844`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - confirm the cosmic background renders;
  - confirm the nodes are planets and the edges are jump routes;
  - confirm the layout is not symmetric;
  - tab through the canvas and confirm keyboard navigation still works;
  - hover and click a planet and confirm the existing interactions still work;
  - console warnings/errors: `0`.
- Performance:
  - the canvas holds 60fps on a standard laptop with the stardust trails running;
  - the canvas holds 30fps on a low-end laptop (soft floor);
  - the CPU usage drops to near zero when the tab is hidden.
