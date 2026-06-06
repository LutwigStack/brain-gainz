# 03 Browser QA

## Status

`planned`

## Goal>

Verify the top layout cleanup end‑to‑end on real data and viewports.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open `Обзор карты` -> `Карта знаний` for `NLH cash`;
- open `Обзор карты` -> `Карта знаний` for `Бакалавриат по информатике`;
- toggle the "details" disclosure and confirm description and context chips appear;
- click a sphere in the nav pad and confirm the atlas filters;
- focus mode enter/exit, confirm the HUD still fits in one row.

## Checks

- top HUD fits in one row by default;
- atlas canvas is the largest object on `desktop 1280x900` (>= `70%` of usable area);
- description and context chips are hidden by default;
- "details" toggle reveals them inline below the row;
- sphere nav pad is visible in the top‑right of the canvas on desktop;
- clicking a sphere dot filters the atlas;
- current sphere dot is highlighted;
- sphere nav pad is hidden on mobile;
- no horizontal overflow on `desktop 1280x900` or `wide desktop`;
- mobile regression: bottom nav and floating actions still work (covered by epic 38 QA);
- focus mode keeps the HUD compact;
- console warnings/errors: `0`.

## Done When

- QA artifacts exist under `qa/`.
- Findings are severity‑ranked with fix recommendations.
- `npm run lint`, `npm run test`, and `npm run build` all pass.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
