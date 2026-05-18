# Assessment Result States Plan

## Order

1. Make passed result own the primary action.
2. Make failed result own retry and explanation.
3. Rename and reposition self-mark.
4. Compact mobile result states.
5. Run browser QA.

## Main Risk

Do not hide the learner's ability to understand why the result happened. Remove stale controls, not result evidence.

## UX Checks

For pass:
- Is `Зачтено` immediately visible?
- Is progress/XP effect clear?
- Is `Следующий шаг` the obvious main action?
- Is the old check button gone or visually irrelevant?

For fail:
- Is `Не зачтено` immediately visible?
- Is the missing condition clear?
- Is retry obvious?
- Is self-mark clearly secondary?

For mobile:
- Can the learner see result and next action without hunting?
- Does the result avoid long repeated form sections?

## QA Targets

- checklist failed result
- checklist passed result
- exact failed/passed result if cheap to reach
- mobile 390px failed result
- mobile 390px passed result
- next step after pass
