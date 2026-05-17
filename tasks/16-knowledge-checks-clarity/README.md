# 16 Knowledge Checks Clarity

## Status

`done`

## Goal

Make knowledge checks understandable to a learner who does not know the internal data model.

The user should clearly understand:
- what to answer
- how the answer will be checked
- why a button is unavailable
- what happened after an attempt
- when progress becomes confirmed
- how confirmed progress differs from manually marked progress

## Why After Russian Pass

The check flow depends heavily on wording. It is better to finish the Russian interface pass first, then refine the check flow using final Russian terms.

## Scope

Includes:
- learner-facing check flow
- answer inputs for each check type
- attempt result states
- failed attempts as normal learning outcomes
- confirmed mastery / XP feedback
- authoring UI for check metadata
- separation between learner mode and author mode

Excludes:
- changing the core XP economy
- building AI tutor behavior
- cloud review or sharing
- full redesign of the node editor

## Success Criteria

- A learner can tell what to enter for exact, number, contains, checklist, manual, and AI-assisted checks.
- Failed attempt does not look like an app error.
- Disabled buttons have one short reason near the action.
- Successful attempt clearly shows confirmed progress and XP.
- Authoring fields are understandable but do not dominate learner mode.
- Browser QA covers at least four check types.

## Workstreams

- `done` - [workstreams/01-check-flow-state-map.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/workstreams/01-check-flow-state-map.md)
- `done` - [workstreams/02-answer-inputs-and-disabled-states.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/workstreams/02-answer-inputs-and-disabled-states.md)
- `done` - [workstreams/03-attempt-results-mastery-and-xp.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/workstreams/03-attempt-results-mastery-and-xp.md)
- `done` - [workstreams/04-authoring-ui-for-checks.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/workstreams/04-authoring-ui-for-checks.md)
- `done` - [workstreams/05-knowledge-checks-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/16-knowledge-checks-clarity/workstreams/05-knowledge-checks-qa.md)
