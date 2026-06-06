# Browser QA

## Status

`pass`

## Coverage

- Desktop smoke: `1440x1000`.
- Mobile smoke: `390x844`.
- App renders with interactive controls.
- Browser console warnings/errors: `0`.
- Screenshots:
  - `qa/29-browser-smoke-desktop.png`
  - `qa/29-browser-smoke-mobile-390.png`
- Raw result: `qa/browser-smoke-result.json`.

## Verification

- `node --test tests/knowledge-city-control.test.js tests/campaigns-stats-xp.test.js tests/today-dashboard-model.test.js tests/learner-lesson-layout.test.js tests/game-view-model.test.js tests/learner-map-overview.test.js tests/mode-boundary.test.js tests/career-knowledge-graph.test.js tests/now-service.test.js tests/map-shortcuts.test.js tests/assessment-copy.test.js` - 143 passed.
- `npm run lint` - passed.
- `npm run build` - passed.
- `git diff --check` - passed with CRLF warnings only.

## Residual Risk

- Browser QA was a smoke pass, not a full scripted learner journey through fail, retry, pass, and next-step navigation.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
