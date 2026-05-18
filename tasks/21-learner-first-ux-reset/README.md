# 21 Learner First UX Reset

## Status

`done`

## Goal

Make BrainGainz understandable for a learner who opens the app and wants to study now.

The app already has campaigns, routes, map, checks, progress, Wind Rose, assets, and authoring tools. The problem is that the learner does not always know what to press next.

This epic reduces the first experience to one clear path:

`Choose campaign -> Today -> Start lesson -> Answer -> Check -> Result -> Next step`

## Product Rule

Every learner-facing screen should answer one question first:

`What should I do now?`

There should be one obvious primary action. Editor tools, debug-like details, destructive actions, and advanced map controls must not compete with the learning action.

## Scope

Includes:
- learner vs author mode boundary
- first session flow
- Today as the main daily screen
- focused check flow
- learner map overview
- safer empty states and button wording
- first 10 minutes browser QA

Excludes:
- adding more course content
- generating new assets
- adding new check types
- redesigning the whole visual style
- cloud sync or accounts

## Success Criteria

- A new learner can start from Campaign Menu and finish one check without guessing.
- Today has one main next action.
- Checks happen in a focused learner flow, not buried in author/editor UI.
- Map defaults to progress overview for learners.
- Authoring and destructive tools are hidden or clearly separated from learner mode.
- Empty states say what to do next, not just that something is missing.
- Browser QA covers the first 10 minutes on desktop and mobile.

## Workstreams

- `done` - [workstreams/01-learner-author-mode-boundary.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/01-learner-author-mode-boundary.md)
- `done` - [workstreams/02-first-session-funnel.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/02-first-session-funnel.md)
- `done` - [workstreams/03-today-single-next-action.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/03-today-single-next-action.md)
- `done` - [workstreams/04-check-as-focused-flow.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/04-check-as-focused-flow.md)
- `done` - [workstreams/05-map-read-only-learning-overview.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/05-map-read-only-learning-overview.md)
- `done` - [workstreams/06-ux-copy-and-empty-states.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/06-ux-copy-and-empty-states.md)
- `done` - [workstreams/07-browser-qa-first-10-minutes.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/workstreams/07-browser-qa-first-10-minutes.md)

## QA Artifacts

- [first-10-minutes-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/first-10-minutes-qa.md)
- [qa/](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/21-learner-first-ux-reset/qa/)
