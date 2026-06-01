# 06 Mobile Nav And Map Overview

## Status

`done`

## Goal

Reduce mobile navigation and map overview density.

## Scope

- mobile nav: one compact primary layer
- show no more than 4 main destinations plus `Еще`
- prevent clipped nav labels
- mobile map overview starts with route orientation: current, next, stage
- canvas/map visual becomes secondary on small screens unless it clearly helps orientation
- keep no horizontal overflow

## Done When

- mobile header feels compact and complete
- map overview answers `where am I and what is next?`
- screenshots cover Today, Lesson, Map at 390px

## Implementation

- Mobile shell navigation now renders one compact primary row and moves secondary destinations into `Ещё`.
- Mobile labels are shortened where needed (`Карта`, `Проверка`) while full accessible labels remain on the buttons.
- Learner map overview starts with `Сейчас`, `Дальше`, and `Этап`; route legend and canvas are secondary below that.
- Mobile map canvas is shorter and ordered after route orientation and route overview.

## Verification

- `node --test tests/mobile-navigation-priority.test.js tests/today-priority-layout.test.js tests/today-dashboard-model.test.js tests/now-service.test.js tests/campaigns-stats-xp.test.js tests/mode-boundary.test.js tests/assessment-copy.test.js`
- `npm run lint`
- `npm run build`
- `git diff --check`
- Browser screenshots:
  - `tasks/26-daily-run-simplification/qa/06-mobile-today-nav.png`
  - `tasks/26-daily-run-simplification/qa/06-mobile-lesson.png`
  - `tasks/26-daily-run-simplification/qa/06-mobile-map-overview.png`
