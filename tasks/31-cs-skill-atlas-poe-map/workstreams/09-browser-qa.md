# 09 Browser QA

## Status

`done`

## Goal

Compare the new skill atlas against the current linear mind-map and verify user comprehension.

## Viewports

- desktop `1280x900`
- wide desktop
- mobile `390x844`

## Scenarios

- open `Бакалавриат по информатике`;
- open `Карта знаний`;
- select `Мастерская кода`;
- inspect far zoom;
- inspect mid zoom;
- inspect close zoom;
- hover/focus several nodes;
- select current route node;
- select weak/contested node;
- open boss/checkpoint node;
- start/check a node from inspector;
- switch learner/author mode if available;
- test mobile selected-node flow.

## Checks

- map no longer appears as a horizontal lesson line;
- circular structure is visible;
- domains/hubs are visible from far/mid zoom;
- node names do not clutter the canvas;
- tooltip makes nodes understandable;
- route overlay does not flatten the map;
- weak/contested states are visible;
- learner view has no primary author handles/free-canvas controls;
- mobile has no horizontal document overflow;
- console warnings/errors: `0`.

## Done When

- QA artifact exists under this epic.
- Screenshots are saved under `tasks/31-cs-skill-atlas-poe-map/qa/`.
- Findings are severity-ranked with fix recommendations.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
