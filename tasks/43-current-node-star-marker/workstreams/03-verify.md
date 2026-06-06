# 03 Verify

## Status

`planned`

## Goal

Confirm the star marker and its pulse in production-like conditions, on both campaigns and both viewports.

## Viewports

- desktop `1280x900`
- mobile `390x844`

## Scenarios

- open `Обзор карты` → `Карта знаний` for `Бакалавриат по информатике`;
- confirm the current node is a star with a corona;
- switch the focused sphere and confirm the marker color updates to the new sphere's `strong` token;
- switch to `Сегодня` and back, confirm the marker is still there;
- hide the tab (open another tab in Chrome), wait 5 seconds, return, confirm the pulse is in phase;
- repeat for `NLH cash`.

## Checks

- the marker is a star, not a flat circle;
- the corona is visible but does not bleed into neighbouring nodes on `1280x900`;
- the pulse is smooth (no visible jank at 30fps screen recording);
- the marker color matches the current sphere's `strong` token;
- no `console.warn` or `console.error` from the render loop or the visibility listener.

## Performance

- the canvas holds 60fps on a standard laptop with the pulse running;
- the canvas holds 30fps on a low-end laptop (soft floor);
- the CPU usage drops to near zero when the tab is hidden.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the marker before and after the epic.
- A 5-second screen recording of the pulse (saved as `qa/pulse.webm`) for both viewports.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
