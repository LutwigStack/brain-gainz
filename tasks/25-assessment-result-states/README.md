# 25 Assessment Result States

## Status

`in_progress`

## Goal

Make the post-check state instantly understandable.

After a learner submits a check, the screen should immediately answer:

- what happened?
- did progress or XP change?
- what should I press next?

The old answer form should not keep competing with the result.

## Problem

The lesson flow is now readable, but result states still carry leftover form UI:

- after pass, `Проверить ответ` remains visible as a disabled old action
- failed and passed states do not fully own the screen
- secondary actions like self-mark still use dry wording
- mobile result state is longer than it needs to be

## Target Experience

Pass:

`Зачтено -> прогресс обновлен -> Следующий шаг`

Fail:

`Не зачтено -> что не выполнено -> Попробовать еще раз / Отметить для себя`

No stale primary check button after success.

## Scope

Includes:
- passed result layout
- failed result layout
- post-result action hierarchy
- self-mark wording
- mobile result compactness
- browser QA on desktop and mobile

Excludes:
- changing scoring logic
- adding new check types
- redesigning the whole lesson screen again
- changing Today or map outside post-result handoff

## Success Criteria

- After a passed check, the main visible action is `Следующий шаг`.
- The old `Проверить ответ` form action is hidden or replaced after success.
- After a failed check, the learner sees why and what to do next.
- `Сам отметил без XP` is replaced with clearer learner wording.
- Mobile pass/fail result states are compact and readable.
- Tests, lint, build, and browser QA pass.

## Workstreams

- `done` - [workstreams/01-passed-result-first-state.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/25-assessment-result-states/workstreams/01-passed-result-first-state.md)
- `done` - [workstreams/02-failed-result-retry-state.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/25-assessment-result-states/workstreams/02-failed-result-retry-state.md)
- `done` - [workstreams/03-self-mark-copy-and-placement.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/25-assessment-result-states/workstreams/03-self-mark-copy-and-placement.md)
- `planned` - [workstreams/04-mobile-result-compactness.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/25-assessment-result-states/workstreams/04-mobile-result-compactness.md)
- `planned` - [workstreams/05-browser-qa-result-states.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/25-assessment-result-states/workstreams/05-browser-qa-result-states.md)
