# 10 UX Stabilization And Daily Flow

## Status

`planned`

## Goal

Make BrainGainz understandable and trustworthy for a user who does not know the internal data model:
- keep campaigns as the entry point
- make `Today` the daily work surface
- make map editing discoverable
- make node inspector tasks separable
- make assessment feedback clear
- reduce dev/debug visual noise
- preserve the existing strategic career / knowledge graph direction

## Scope

Includes:
- transaction and user-facing error boundaries for assessment and route actions
- campaign menu entry clarity
- `Today` primary work loop
- map creation / connection / deletion affordances
- inspector mode split for overview, route, assessment, and graph details
- assessment validation states and check authoring clarity
- large graph overview and route overlay readability
- wind rose branch polish
- visual density and mobile pass
- manual UX regression checklist

Excludes:
- new XP economy rules
- new generated game asset families
- cloud sync
- marketplace / sharing
- full visual redesign from scratch
- rewriting the mastery domain model beyond what is needed for user clarity

## Product Direction

The app should feel like a working learning command surface, not a debug dashboard.

Users should understand:
- which campaign they are in
- what to do next today
- how to open or build a route
- how to create, move, connect, and archive nodes
- whether progress is self-marked or verified
- why an assessment can or cannot be accepted
- how stats and branches lead back to the map

Use visual state first:
- hierarchy
- grouping
- icon state
- progress shape
- disabled / active / verified / draft treatments
- details on click

Avoid:
- raw SQL or implementation errors in UI
- permanent explanatory paragraphs as the main fix
- multiple competing primary buttons
- identical badges for different meanings
- developer-only labels as primary user-facing copy
- making hidden gestures the only path for core actions

## Success Criteria

- Assessment pass/fail and route actions no longer show transaction errors.
- `Today` has one obvious next action above secondary game/status panels.
- Empty or incomplete routes do not expose dangerous CTAs.
- Map users can discover create/connect/delete actions without knowing shortcuts.
- Inspector users can distinguish overview, route editing, self-marking, assessment, and graph details.
- Assessment disabled states explain the missing requirement without contradiction.
- Large graphs open in a readable overview.
- Campaign menu distinguishes system/developer data from user campaigns.
- Wind Rose remains visual and navigational rather than table-like.
- Mobile 390px layouts remain usable for Campaign Menu, Today, and Map.

## Workstreams

- `planned` - [workstreams/01-trust-and-error-boundaries.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/01-trust-and-error-boundaries.md)
- `planned` - [workstreams/02-campaign-menu-entry-clarity.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/02-campaign-menu-entry-clarity.md)
- `planned` - [workstreams/03-today-primary-work-loop.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/03-today-primary-work-loop.md)
- `planned` - [workstreams/04-map-editing-affordances.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/04-map-editing-affordances.md)
- `planned` - [workstreams/05-inspector-task-mode-split.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/05-inspector-task-mode-split.md)
- `planned` - [workstreams/06-assessment-validation-and-authoring.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/06-assessment-validation-and-authoring.md)
- `planned` - [workstreams/07-map-overview-and-route-readability.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/07-map-overview-and-route-readability.md)
- `planned` - [workstreams/08-wind-rose-branch-polish.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/08-wind-rose-branch-polish.md)
- `planned` - [workstreams/09-visual-density-and-mobile-pass.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/09-visual-density-and-mobile-pass.md)
- `planned` - [workstreams/10-ux-regression-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/10-ux-stabilization-and-daily-flow/workstreams/10-ux-regression-qa.md)
