# 02 Failed Result Retry State

## Status

`done`

## Goal

After failure, make retry and missing conditions obvious.

## Scope

- show `Не зачтено` as a normal learning result
- summarize what is missing
- make retry the main next action
- keep `Отметить для себя` secondary
- avoid making failure look like an app error

## Done When

- failed result tells the learner what happened
- learner can retry without rereading the whole screen
- result copy stays compact on mobile

## Notes

- Failed state now renders `Не зачтено`, a compact `Что не выполнено` reason, and primary `Попробовать еще раз`.
- `Отметить для себя` stays secondary in the failed result state.
- Pressing retry returns the learner to the editable check form.
- Covered by `tests/learner-lesson-layout.test.js`.
- Browser smoke screenshot: `tasks/25-assessment-result-states/qa/02-failed-result-retry-state.png`.
