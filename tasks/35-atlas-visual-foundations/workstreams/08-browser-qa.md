# 08 Browser QA

## Status

`planned`

## Goal

Verify the visual foundations of the atlas end‑to‑end on real data and viewports.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open `Обзор карты` -> `Карта знаний` for `NLH cash`;
- open `Обзор карты` -> `Карта знаний` for `Бакалавриат по информатике`;
- hover several topic nodes at default zoom and at `zoom 0.6+`;
- pan and zoom in and out;
- switch to focus mode and back;
- reload and confirm stars and grid stay stable.

## Checks

- every sphere sector is visible without zooming;
- nodes fill their rings, not just a single arc;
- graph edges are visible at `zoom 0.5`;
- selected path edges are brighter than the rest of the graph;
- topic labels appear at `zoom 0.6+`;
- `weak`, `contested`, `verified`, `locked` are distinguishable by shape;
- tooltip shows mastery bar and `#N` for route nodes;
- sphere sector labels are visible and not overlapping nodes;
- resize does not shuffle stars;
- no visual regression in `graph` (non‑atlas) presentation;
- mobile has no horizontal overflow;
- console warnings/errors: `0`.

## Done When

- QA artifacts exist under `qa/`.
- Findings are severity‑ranked with fix recommendations.
- `npm run lint`, `npm run test`, and `npm run build` all pass.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
