# 03 Browser QA

## Status

`planned`

## Goal

Verify the hero removal and minimap cleanup end‑to‑end on real data and viewports.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open `Обзор карты` -> `Карта знаний` for `NLH cash`;
- open `Обзор карты` -> `Карта знаний` for `Бакалавриат по информатике`;
- open the `graph` (non‑atlas) presentation;
- reload after dismissing the minimap and confirm it stays hidden.

## Checks

- the floating hero is not visible on the atlas;
- the step indicator is visible in the bottom‑left and shows the current step;
- the minimap is hidden in `skill-atlas` mode on desktop and mobile;
- the minimap is visible by default in `graph` mode;
- clicking the `×` on the minimap hides it;
- after reload, the dismissed state persists;
- no console errors related to `heroLayer` or minimap;
- console warnings/errors: `0`.

## Done When

- QA artifacts exist under `qa/`.
- Findings are severity‑ranked with fix recommendations.
- `npm run lint`, `npm run test`, and `npm run build` all pass.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
