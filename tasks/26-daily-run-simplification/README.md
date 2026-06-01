# 26 Daily Run Simplification

## Status

`in_progress`

## Goal

Make daily study feel fast, obvious, and trustworthy after the first lesson.

The first lesson loop now works. The next problem is daily use: after 2-3 lessons, Today and Daily Run expose too many queue controls and confusing states.

Target daily loop:

`Today -> one next lesson -> result -> next lesson`

The learner should not manage a queue unless they choose to open details.

## Research Source

This epic comes from multi-agent UX research on `2026-06-01`.

Main findings:
- retry result state conflicts with the new attempt
- exact checks can reveal the answer in learner UI
- Today/Daily Run becomes a control panel after several steps
- `Готово` and `Еще раз` are ambiguous and can undermine trust in mastery/XP
- mobile nav and map overview are still too dense

## Scope

Includes:
- retry state cleanup
- hiding correct answers from learner checks
- Daily Run primary path simplification
- queue action naming and hierarchy
- Today focus/scroll after next step
- mobile navigation simplification
- learner map overview simplification
- browser QA for 2-3 lessons in a row

Excludes:
- new course content
- new assets
- new check types
- full visual redesign
- cloud/account work

## Success Criteria

- Retry shows only the new attempt as the main surface.
- Learner UI never exposes the expected answer for exact checks.
- Today shows one next lesson and one dominant CTA after each result.
- Full Daily Run queue controls are hidden behind details.
- `Готово` and `Еще раз` no longer read like verified mastery actions.
- Mobile navigation has one compact primary layer.
- Mobile map overview starts with route orientation, not a mostly empty canvas.
- Browser QA covers at least 3 consecutive lesson/result transitions.

## Workstreams

- `done` - [workstreams/01-retry-state-reset.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/01-retry-state-reset.md)
- `done` - [workstreams/02-hide-expected-answers.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/02-hide-expected-answers.md)
- `planned` - [workstreams/03-today-one-next-lesson.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/03-today-one-next-lesson.md)
- `planned` - [workstreams/04-daily-queue-action-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/04-daily-queue-action-model.md)
- `planned` - [workstreams/05-next-step-focus-and-summary.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/05-next-step-focus-and-summary.md)
- `planned` - [workstreams/06-mobile-nav-and-map-overview.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/06-mobile-nav-and-map-overview.md)
- `planned` - [workstreams/07-browser-qa-daily-run.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/26-daily-run-simplification/workstreams/07-browser-qa-daily-run.md)
