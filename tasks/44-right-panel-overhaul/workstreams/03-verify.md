# 03 Verify

## Status

`planned`

## Goal

Confirm the right `Занятие` panel in production-like conditions, on both campaigns and both viewports.

## Viewports

- desktop `1280x900`
- mobile `390x844`

## Scenarios

- open `Обзор карты` → `Карта знаний` for `Бакалавриат по информатике`;
- confirm the panel has exactly three blocks;
- click each mastery step and confirm the chip highlights and the active state persists;
- click `Начать занятие` and confirm the daily-run flow still starts;
- repeat for `NLH cash`.

## Checks

- the panel has three blocks in the order `status / action / mastery`;
- the dropped blocks (`Режим ученика`, `Обзор / Изучать`, `Прогресс узла`, `Учебный путь`) are not in the panel;
- the six mastery chips have visible labels matching the table in the epic README;
- the helper line under the chips is visible;
- the panel is the same width as before and is shorter;
- no `console.warn` or `console.error` from the panel.

## Done When

- QA artifact under `qa/` with side-by-side screenshots of the panel before and after the epic.
- The `masterySteps` data source matches the table in the epic README.
- `npm run lint`, `npm run test`, and `npm run build` all pass.
