# 22 First Five Minutes Simplification

## Status

`planned`

## Goal

Make the first five minutes feel obvious and calm for a learner.

Epic 21 created a working learner path. This epic removes the remaining admin-like friction from that path.

Target path:

`Campaign -> Today -> Start lesson -> Check -> Result -> Next step`

No map detour. No visible authoring mode. No internal words as primary learner copy.

## Product Rule

The learner should never have to understand the app's internal model before the first completed check.

If a control does not help the learner complete the current lesson, it should be hidden, moved, or made secondary.

## Scope

Includes:
- direct Today-to-lesson/check handoff
- hiding author mode from the first learner path
- replacing internal learner-facing terms
- simplifying the top shell and side navigation
- simplifying mobile first screen
- QA of the first five minutes

Excludes:
- new course content
- new art/assets
- new check types
- full visual redesign
- removing author mode entirely

## Success Criteria

- `Начать занятие` opens the focused lesson/check path directly when a check is available.
- The learner does not see `Настраиваю` as a primary top-level choice during the first path.
- Learner-facing screens do not use `инспектор`, `фокус`, `фронт маршрута`, or raw authoring language as primary labels.
- Top shell shows only context that helps the current step.
- Mobile first screen fits the main action without feeling like a control panel.
- Browser QA proves the path on desktop and mobile.

## Workstreams

- `done` - [workstreams/01-direct-start-lesson-flow.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/22-first-five-minutes-simplification/workstreams/01-direct-start-lesson-flow.md)
- `done` - [workstreams/02-hide-author-mode-from-learner-path.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/22-first-five-minutes-simplification/workstreams/02-hide-author-mode-from-learner-path.md)
- `planned` - [workstreams/03-learner-language-cleanup.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/22-first-five-minutes-simplification/workstreams/03-learner-language-cleanup.md)
- `planned` - [workstreams/04-top-shell-priority-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/22-first-five-minutes-simplification/workstreams/04-top-shell-priority-pass.md)
- `planned` - [workstreams/05-mobile-first-screen-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/22-first-five-minutes-simplification/workstreams/05-mobile-first-screen-pass.md)
- `planned` - [workstreams/06-browser-qa-first-five-minutes.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/22-first-five-minutes-simplification/workstreams/06-browser-qa-first-five-minutes.md)
