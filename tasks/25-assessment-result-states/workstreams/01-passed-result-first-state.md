# 01 Passed Result First State

## Status

`done`

## Goal

After success, make the passed result and next step the main screen state.

## Scope

- hide or replace the stale `Проверить ответ` action after success
- show `Зачтено` and progress/XP effect clearly
- make `Следующий шаг` the dominant action
- keep completed criteria visible but secondary
- prevent repeated submission confusion

## Done When

- passed result does not look like the learner should press check again
- `Следующий шаг` is the primary action
- tests cover passed post-check state where practical

## Notes

- Passed state now renders `Зачтено`, explicit progress/XP rows, and `Следующий шаг` as the primary action.
- XP row intentionally avoids a numeric amount until the snapshot exposes the actual XP grant.
- Passed assessment inputs remain disabled, preventing local edits after saved success.
- Covered by `tests/learner-lesson-layout.test.js`.
- Browser smoke screenshot: `tasks/25-assessment-result-states/qa/01-passed-result-state.png`.
