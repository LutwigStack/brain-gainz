# Result States QA

Date: 2026-05-19

## Scope

Desktop and 390px mobile browser QA for the first learner result-state loop:

- create learner campaign from the CS template
- open the first lesson from Today
- save a failed attempt
- retry from the failed result
- pass the checklist check
- press `Следующий шаг`
- inspect browser console warnings/errors

## Result

Pass.

The result states are immediately understandable:

- failed state shows `Не зачтено`, explains that progress and XP did not change, and gives `Попробовать еще раз` as the primary action
- retry returns to an editable form without the compact result-state layout
- passed state shows `Зачтено`, progress/XP status, and `Следующий шаг` as the primary action
- the old `Проверить ответ` action is not visible after pass
- mobile result cards appear before the criteria/form content and stay in the first screen
- no horizontal overflow was detected on desktop or 390px mobile
- console warnings/errors were empty on both runs

## Screenshots

- `tasks/25-assessment-result-states/qa/05-desktop-failed-result.png`
- `tasks/25-assessment-result-states/qa/05-desktop-passed-result.png`
- `tasks/25-assessment-result-states/qa/05-mobile-390-failed-result.png`
- `tasks/25-assessment-result-states/qa/05-mobile-390-passed-result.png`

## Browser Checks

Desktop 1280x900:

- failed result: result-state class enabled, retry CTA visible, submit action hidden, overflow clear
- retry state: result-state class removed, checklist editable, readiness/autosave visible, submit action restored
- passed result: passed result-state class enabled, checklist read-only, `Следующий шаг` visible, submit action hidden
- next step: handoff leaves the lesson result surface and opens the next-step surface
- console: no warnings or errors

Mobile 390x844:

- failed result: result card appears above criteria, retry CTA visible, readiness/autosave hidden in result-state, overflow clear
- retry state: result-state class removed, checklist editable, readiness/autosave visible, submit action restored, overflow clear
- passed result: result card appears above criteria, `Следующий шаг` visible, checklist read-only, submit action hidden, overflow clear
- next step: handoff opens the next-step surface
- console: no warnings or errors

## Checks

- `node --test tests/learner-lesson-layout.test.js tests/assessment-copy.test.js tests/mode-boundary.test.js tests/today-dashboard-model.test.js`
- `npm run lint`
- `npm run build`
- `git diff --check`
