# 43 Current Node Star Marker

## Status

`planned`

## Goal

Replace the current "you are here" marker on the `Карта знаний` canvas with a star that has a soft corona and a slow pulse. The marker must be readable on a deep-space background (the canvas palette is moving to cosmic in epic 47) and must not obscure the node it is pointing at.

## Why This Epic Exists

The current marker (visible on `output/current-05-skill-map-tab.png`) is a single large cyan circle with a thin outline. On the new cosmic background (epic 47) a flat circle will lose contrast and feel out of place. A star with a corona reads as "this is the active star system" and matches the cosmic metaphor, while the pulse gives the marker a sense of life without becoming distracting.

## Product Direction

- the marker is a layered shape: a 4-point star with a soft outer glow and a thin inner highlight;
- the star body is filled with the `sphere-{slug}-strong` token of the current sphere, with a 1px white inner stroke;
- the corona is a radial gradient in the same color, fading from 30% alpha at the edge of the star to 0% at 3x the star radius;
- the pulse is a `0.96 → 1.04` scale on the corona only, with a 2.4s period and an ease-in-out curve;
- the marker never blocks the node text or the action buttons; it sits behind the node label and is allowed to overlap edges.

## Visual Targets

### Static state

- star body: 4-point, ~14px radius, filled with the sphere's `strong` token;
- inner stroke: 1px white at 60% alpha;
- corona: 42px diameter, radial gradient, 0% alpha at the edge;
- z-order: behind the node label and the breadcrumb, above the edges and the node fill.

### Pulse

- the corona scale animates from `0.96` to `1.04` over `2.4s`, ease-in-out, looped;
- the star body does not animate (kept stable for legibility);
- the pulse is paused when the atlas is not the focused tab (to avoid wasting CPU on a hidden canvas).

## Scope

Includes:

- the current-node marker in `src/game/layers/map-layer.ts` (or wherever the marker is currently drawn; the epic notes the relevant section);
- the new `StarMarker` rendering helper in `src/game/layers/effects-layer.ts` if the marker benefits from a separate layer;
- the CSS / JS pulse animation in the same file (no global animation library introduced for this);
- the link between the current sphere and the marker color (read from the new sphere tokens defined in epic 41).

Excludes:

- A new layer for the corona if the existing layer order can absorb it (keep the layer count flat for now);
- Animating the edges or the breadcrumb (out of scope);
- A clickable marker (out of scope; the marker is informational).

## Success Criteria

- On a freshly opened `Карта знаний` view, the current node is visibly a star, not a flat circle.
- The corona is visible but does not bleed into neighbouring nodes on the standard `1280x900` viewport.
- The pulse is smooth (no jank) and pauses when the tab is not focused.
- The marker color matches the current sphere's `strong` token.
- No regression in the breadcrumb, the edges, or the right `Занятие` panel.

## Workstreams

- `planned` - [workstreams/01-marker-redesign.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/43-current-node-star-marker/workstreams/01-marker-redesign.md)
- `planned` - [workstreams/02-pulse-animation.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/43-current-node-star-marker/workstreams/02-pulse-animation.md)
- `planned` - [workstreams/03-verify.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/43-current-node-star-marker/workstreams/03-verify.md)

## Suggested Sequence

1. Replace the marker geometry with a star + corona.
2. Wire the pulse to the existing render loop and to the tab focus state.
3. Verify visually and via a frame-rate test.

## Test Plan

- `npm run lint`
- `npm run test`
- `npm run build`
- Browser QA:
  - desktop `1280x900` and mobile `390x844`;
  - `NLH cash` and `Бакалавриат по информатике`;
  - confirm the marker is a star with a corona;
  - switch the focused sphere and confirm the marker color updates;
  - switch to another tab and confirm the pulse pauses (CPU drops in the dev tools);
  - console warnings/errors: `0`.
- Performance:
  - the canvas holds 60fps on a standard laptop with the pulse running;
  - the canvas holds 30fps on a low-end laptop (a soft floor, not a hard requirement).
