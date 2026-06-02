# 09 Browser QA

## Status

`done`

## Build

- URL: `http://127.0.0.1:5176/`
- Date: `2026-06-02`
- Scope: learner CS program, map overview, `Карта знаний` layer, readability pass, route action, mobile `390x844`.

## Screenshots

- `09-skill-atlas-desktop.png`
- `09-skill-atlas-hover.png`
- `09-skill-atlas-mobile.png`
- `09-skill-atlas-mobile-full.png`
- `09-skill-atlas-route-action-canvas.png`
- `10-readability-atlas-desktop.png`
- `10-readability-atlas-canvas.png`
- `10-readability-atlas-deep.png`
- `10-readability-route-action-canvas.png`
- `10-readability-atlas-mobile.png`
- `10-readability-atlas-mobile-full.png`
- `10-readability-explicit-stroke.png`
- `10-readability-root-program-title-wide.png`

## Result

Pass with P3 follow-ups.

The CS learner map now reads as a skill atlas rather than a radial debug graph. Atomic nodes are clustered around their topic hubs, structure spokes are thin background threads, and the route overlay is limited and subdued. The full atlas now renders hub-to-hub connections with explicit strokes, matching the minimap hierarchy without turning the route or sector backdrop into thick spokes. The center root represents the active program instead of a technical atlas placeholder. Mobile has no horizontal document overflow and keeps the atlas canvas usable above the selected lesson inspector.

## Findings

[P3] Keyboard focus tooltip is not yet equivalent to hover. Selected-node inspector remains the fallback for keyboard/touch users, so the learner can still understand the node after selection, but a true focus tooltip would make the atlas more consistent.

[P3] Long-term 1000+ node hardening is still future work. The current MVP is responsive for the 86-node CS atlas and keeps labels/tooltips lazy, but spatial culling/indexing should be added before a much larger authored atlas.

## Checks

- Desktop atlas screenshot: pass.
- Readability centered canvas screenshot: pass.
- Full atlas backbone matches minimap hierarchy: pass.
- Center root title is the active program, not `Program Atlas`: pass.
- Route action keeps full atlas visible and uses route only as overlay: pass.
- Hover tooltip screenshot: pass.
- Mobile `390x844`: pass.
- Console warnings/errors: `0`.
