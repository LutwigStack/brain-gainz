# 03 Verify

## Status

`planned`

## Goal

Confirm the galaxy holo minimap and the click-to-jump behavior on the live app.

## Viewports

- desktop `1280x900`
- mobile `390x844`

## Scenarios

- open `Обзор карты` → `Карта знаний` for `Бакалавриат по информатике`;
- confirm the minimap renders as a galaxy holo with 8 clusters and a viewport rectangle;
- click the center of the minimap and confirm the canvas centers on the current node;
- click a corner of the minimap and confirm the canvas jumps to that area;
- switch the focused sphere and confirm the highlighted cluster follows;
- in `graph` mode, confirm the dismiss button from epic 37 still hides the minimap;
- repeat for `NLH cash`.

## Checks

- the minimap renders as a galaxy holo on both viewports;
- the current sphere cluster is highlighted in the `strong` token;
- the viewport rectangle tracks the current canvas viewport;
- clicking the minimap moves the canvas viewport;
- the click is debounced (no flicker on rapid clicks);
- the screen reader announces the sphere name when the click lands in a cluster (verified with VoiceOver or NVDA);
- no `console.warn` or `console.error` from the minimap or the click handler.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the minimap before and after the epic.
- A 10-second screen recording of clicking around the minimap (saved as `qa/minimap-jump.webm`).
- `npm run lint`, `npm run test`, and `npm run build` all pass.
