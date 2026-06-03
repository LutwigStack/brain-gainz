# 04 Browser QA

## Status

`planned`

## Goal

Verify mobile and touch behavior end‑to‑end on real data and viewports.

## Viewports

- mobile `390x844`
- mobile `414x896`
- tablet `768x1024`
- desktop `1280x900` (regression check)

## Scenarios

- open `Обзор карты` -> `Карта знаний` for `NLH cash` on mobile;
- open `Обзор карты` -> `Карта знаний` for `Бакалавриат по информатике` on mobile;
- tap each node type and confirm selection;
- pinch‑zoom out to confirm full atlas is reachable;
- confirm bottom nav is reachable in one tap;
- confirm auto‑fit to current step on first mount;
- switch to focus mode and back.

## Checks

- atlas canvas shows at least one full sphere sector on first mobile mount;
- current step is visible without manual zoom;
- touch hit areas meet the minimums in `README.md`;
- bottom nav is reachable in one tap;
- floating action cluster does not cover more than `~25%` of the canvas height;
- no horizontal overflow on `390x844`, `414x896`, or `768x1024`;
- grid is suppressed in atlas mode on both mobile and desktop;
- desktop regression: no visual change in `graph` mode or focus mode;
- console warnings/errors: `0`.

## Done When

- QA artifacts exist under `qa/`.
- Findings are severity‑ranked with fix recommendations.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
