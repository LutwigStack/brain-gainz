# Human Readable Lesson QA

## Status

`pass`

## Scope

- desktop viewport: 1280x900
- mobile viewport: 390x844
- source path: CS campaign Today -> first lesson
- covered: open lesson, save failed attempt, pass checklist-style criteria, follow next step, inspect console warnings/errors

## Result

The learner loop is understandable on desktop and mobile. The lesson reads as a short learning task with visible criteria, one primary action, clear failed/passed result states, and a next-step CTA after success.

The only learner-facing technical wording found during QA was the passed result text `Все обязательные пункты чек-листа отмечены.`. It was fixed to `Все обязательные условия отмечены.` and rechecked in both desktop and mobile.

The first pass screenshots also exposed that criteria checkboxes visually reset after a successful attempt while the result said all conditions were marked. The lesson now restores the selected conditions from the latest attempt evidence and replaces the repeated `Проверить ответ` action with a compact `Зачтено` state and `Следующий шаг` CTA after success.

Follow-up QA also removed the dry `учебный поток` state label from the learner lesson and replaced the self-mark button copy with `Отметить для себя`. After a successful attempt, the self-mark and failed-attempt secondary buttons are hidden so the success state stays short.

A later pass-state check confirmed the completed criteria and answer fields are read-only after success, so the saved `Зачтено` state cannot be contradicted by local edits.

No console warnings or errors were observed in either viewport.

## Desktop

- opened first lesson from Today
- saved failed attempt with `Не получилось`
- checked all criteria and passed with `Проверить ответ`
- passed state keeps the completed criteria visibly checked
- passed state replaces the check action with compact `Зачтено` plus `Следующий шаг`
- successful state no longer shows the disabled `Проверить ответ` action or secondary self-mark/fail buttons
- completed criteria and answer fields are disabled after success
- `Следующий шаг` returned to Today and advanced the main goal to the next lesson
- no document-level horizontal overflow

Screenshots:

- `tasks/24-human-readable-lesson-flow/qa/06-desktop-lesson-open.png`
- `tasks/24-human-readable-lesson-flow/qa/06-desktop-lesson-failed.png`
- `tasks/24-human-readable-lesson-flow/qa/06-desktop-lesson-passed.png`
- `tasks/24-human-readable-lesson-flow/qa/06-desktop-next-step.png`

## Mobile 390px

- opened first lesson from Today at 390x844
- task and main action were visible without horizontal page overflow
- saved failed attempt with `Не получилось`
- checked all criteria and passed with `Проверить ответ`
- passed state keeps the completed criteria visibly checked
- passed state replaces the check action with compact `Зачтено` plus `Следующий шаг`
- successful state no longer shows the disabled `Проверить ответ` action or secondary self-mark/fail buttons
- completed criteria and answer fields are disabled after success
- `Следующий шаг` was visible and returned to Today with the next lesson as the main goal
- no document-level horizontal overflow

Screenshots:

- `tasks/24-human-readable-lesson-flow/qa/06-mobile-lesson-open-390.png`
- `tasks/24-human-readable-lesson-flow/qa/06-mobile-lesson-failed-390.png`
- `tasks/24-human-readable-lesson-flow/qa/06-mobile-lesson-passed-390.png`
- `tasks/24-human-readable-lesson-flow/qa/06-mobile-lesson-passed-readonly-390.png`
- `tasks/24-human-readable-lesson-flow/qa/06-mobile-next-step-390.png`

## Remaining Terms

No blocker technical/service terms remain in the learner-primary lesson result copy. Secondary product language still includes `XP`, `маршрут`, `прогресс`, and `подтвержденное освоение`; these are product concepts rather than verifier terms.

## Verification

- browser QA desktop: pass
- browser QA mobile 390px: pass
- console warning/error check: pass
