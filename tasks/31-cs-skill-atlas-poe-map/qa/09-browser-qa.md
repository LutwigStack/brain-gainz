# 09 Browser QA

## Status

`done`

## Build

- URL: `http://127.0.0.1:5176/`
- Date: `2026-06-02`
- Scope: learner CS program, map overview, `Карта знаний` layer, desktop hover tooltip, mobile `390x844`.

## Screenshots

- `09-skill-atlas-desktop.png`
- `09-skill-atlas-hover.png`
- `09-skill-atlas-mobile.png`
- `09-skill-atlas-mobile-full.png`
- `09-skill-atlas-route-action-canvas.png`

## Result

Pass with P3 follow-ups.

The CS learner map opens as an atlas instead of the old route-like line. The first view shows the whole bachelor atlas, icon nodes, limited route/current overlay, no node label clutter, and no learner-facing author handles. Hover tooltip opens with the node title, route context, and current action. Mobile has no horizontal document overflow and uses a taller atlas canvas with the selected lesson inspector below it.

## Findings

[P3] Keyboard focus tooltip is not yet equivalent to hover. Selected-node inspector remains the fallback for keyboard/touch users, so the learner can still understand the node after selection, but a true focus tooltip would make the atlas more consistent.

[P3] Long-term 1000+ node hardening is still future work. The current MVP is responsive for the 86-node CS atlas and keeps labels/tooltips lazy, but spatial culling/indexing should be added before a much larger authored atlas.

## Checks

- Desktop atlas screenshot: pass.
- Hover tooltip screenshot: pass.
- Mobile `390x844`: pass.
- Route action keeps full atlas visible and uses route only as overlay: pass.
- Console warnings/errors: `0`.
