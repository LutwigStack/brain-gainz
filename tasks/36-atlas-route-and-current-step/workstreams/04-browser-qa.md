# 04 Browser QA

## Status

`planned`

## Goal

Verify the route and current‑step work end‑to‑end on real data and viewports.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open `Обзор карты` -> `Карта знаний` for `NLH cash`;
- open `Обзор карты` -> `Карта знаний` for `Бакалавриат по информатике`;
- identify the current step without opening the inspector;
- click a route chip in the bottom strip and confirm the camera centers;
- advance the route (complete a check) and confirm the transition pulse plays once;
- focus mode enter/exit, confirm the strip stays usable.

## Checks

- current step is identifiable within `~0.5s` on a fresh view;
- inner cyan pulse and outer yellow pulse are both visible on the current step;
- checkpoint marker above the current step does not overlap the label;
- route strip shows current + next 3‑5 + weak + boss without horizontal scroll on desktop;
- mobile route strip is horizontally scrollable and visible at the bottom of the canvas;
- clicking a route chip centers the camera and the canvas responds;
- advancing the route plays a one‑shot pulse that does not loop;
- focus mode keeps the route strip accessible;
- no horizontal overflow on mobile;
- console warnings/errors: `0`.

## Done When

- QA artifacts exist under `qa/`.
- Findings are severity‑ranked with fix recommendations.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
