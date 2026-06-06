# 05 Verify

## Status

`planned`

## Goal

Confirm the cosmic canvas in production-like conditions, on both campaigns and both viewports.

## Viewports

- desktop `1280x900`
- wide desktop `1680x1050`
- mobile `390x844`

## Scenarios

- open `Обзор карты` → `Карта знаний` for `Бакалавриат по информатике`;
- confirm the background is a deep-space field with eight nebulae;
- confirm the nodes are planets (three sizes, optional ring, inner icon);
- confirm the edges are jump routes (curved line + stardust trail);
- confirm the current node is at the visual focal point;
- confirm the layout is not symmetric;
- tab through the canvas and confirm keyboard navigation still works;
- hover and click a planet and confirm the existing interactions still work;
- switch the focused sphere and confirm the layout, the marker, and the trail all follow;
- repeat for `NLH cash`.

## Checks

- the canvas background is cosmic (deep navy with tinted nebulae);
- the nodes are planets, not flat circles;
- the edges are jump routes, not straight lines;
- the current node is at the focal point and the layout is not symmetric;
- keyboard navigation, hover, and click all work;
- the marker from epic 43 is visible on the current planet;
- the minimap from epic 46 is visible in the bottom-right and is clickable;
- the right `Занятие` panel from epic 44 is visible on the right;
- no `console.warn` or `console.error` from the canvas or the layers.

## Performance

- the canvas holds 60fps on a standard laptop with the stardust trails and the marker pulse running;
- the canvas holds 30fps on a low-end laptop (soft floor);
- the CPU usage drops to near zero when the tab is hidden;
- the memory footprint does not grow over a 5-minute idle session.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the canvas before and after the epic.
- A 10-second screen recording of the canvas with the stardust trails and the marker pulse running (saved as `qa/cosmic-canvas.webm`).
- A short note from the verifier on whether the layout is acceptable for both campaigns.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
