# Browser QA

## Status

`done`

## Coverage

- Desktop atlas workspace: `NLH cash` -> `Обзор карты` -> `Карта знаний`.
- Focus mode: `Фокус` hides top context and left rail; `Esc` exits focus.
- Drawer: selected-node preview stays visible over the map and opens details on demand.
- Mobile `390x844`: atlas workspace has no horizontal overflow, uses bottom sheet drawer, and keeps the canvas visible on the first screen.

## Screenshots

- `desktop-atlas-workspace.png`
- `mobile-atlas-workspace.png`

## Findings

- No blocking findings.
- Console check saw one stale Vite reload error from an old `5176` session timestamp, not a current runtime error on the tested `5179` tab.

## Checks

- `node --test tests/learner-lesson-layout.test.js tests/program-hierarchy.test.js tests/skill-atlas-layout.test.js tests/mode-boundary.test.js tests/map-shortcuts.test.js tests/game-view-model.test.js` - 41 passed.
- `npm run lint` - passed.
- `npm run build` - passed.
