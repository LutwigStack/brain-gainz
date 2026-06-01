# 05 Next Step Focus And Summary

## Status

`done`

## Goal

After `Следующий шаг`, put the learner back on the next lesson, not in the middle of the task list.

## Scope

- reset scroll/focus to Today hero after next-step handoff
- ensure the hero reflects the new current lesson
- avoid returning to old completed result surfaces
- make daily completion summary consistent: completed count, remaining repeat, XP

## Done When

- after pass -> next step, the next lesson is immediately visible
- summary does not contradict itself
- focus behavior is tested in browser QA

## Implementation

- `Следующий шаг` now routes through a Today focus request instead of a plain tab switch.
- Today hero is focusable and receives scroll/focus when returning from the lesson result.
- Daily Run finished summary uses one status label plus short human-readable lines: closed count, repeat count, XP.

## Verification

- `node --test tests/today-priority-layout.test.js tests/now-service.test.js tests/today-dashboard-model.test.js tests/mode-boundary.test.js tests/assessment-copy.test.js`
- Browser QA: after passing a lesson, `Следующий шаг` returns to Today with the hero visible and focused (`data-today-main-goal` active, `scrollY = 0`) on desktop and 390px mobile.
  Screenshots:
  - `tasks/26-daily-run-simplification/qa/05-next-step-focus-desktop.png`
  - `tasks/26-daily-run-simplification/qa/05-next-step-focus-mobile.png`
