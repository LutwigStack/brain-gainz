# 11 UX Safety And Daily Clarity

## Status

`planned`

## Goal

Turn the post-stabilization BrainGainz UI into a safer daily work surface:
- protect destructive map actions from accidental data loss
- make `Today` explain the real campaign state and next step
- make large map overview stable enough for orientation
- reduce technical language in assessment and inspector flows
- keep Campaign Menu, Wind Rose, and mobile usable without a full redesign

## Source Review

This epic is based on the visual UX review after the first UX stabilization pass.

Review environment:
- dev server reused at `http://127.0.0.1:5178/`
- desktop viewport `1280x900`
- mobile viewport `390x844`
- browser console had no warnings/errors during the review

Key review findings:
- archiving a selected node from the map toolbar happens in one click, without confirmation, undo, or an obvious restore path
- `Today` can look empty even when the selected campaign has nodes and XP
- large graphs can render, but still fail as a stable user overview
- assessment copy still exposes technical verifier / evidence / result terms on the primary surface
- inspector tabs help, but the primary action is still hard to find
- Campaign Menu, Wind Rose, mobile, and the pixel visual language need a smaller polish pass after the safety work

## Scope

Includes:
- destructive-action confirmation, undo, and restore affordances for node archive flows
- `Today` state model and UI copy for empty / free mode / no route / active route states
- large graph overview and focus behavior improvements
- assessment language and progressive disclosure for verifier details
- inspector primary action and density cleanup
- Campaign Menu hierarchy polish
- Wind Rose branch CTA deduplication
- mobile header / working-area pass
- manual safety-oriented UX regression checklist

Excludes:
- new XP economy rules
- cloud sync
- full visual redesign
- replacing the map renderer
- changing mastery semantics beyond what is needed for user clarity
- bulk content/data repair beyond safe undo/restore support

## Product Direction

The app should make dangerous actions hard to trigger accidentally and make daily work obvious.

Every primary screen should answer:
- where am I?
- what is the current state?
- what is the safest next action?
- what changed after my last action?

Use structure and state instead of longer explanations:
- confirmation for destructive actions
- undo toasts for reversible changes
- visible archived-node restore paths
- one primary action per major surface
- compact secondary game/status panels
- stable map focus chips and overview controls
- progressive disclosure for advanced assessment evidence

## Success Criteria

- A user cannot archive a node by accidentally pressing one toolbar button without a confirmation or immediate undo path.
- Archived nodes have an obvious restore path from the relevant map/inspector context.
- `Today` explains why it has no current work item when the campaign still has nodes or XP.
- `Today` shows one dominant next step before race/city/opponent status.
- Large graph free-canvas view opens in a readable overview with stable focus behavior.
- Assessment primary UI uses user-facing language; verifier IDs and raw evidence live behind advanced details.
- Inspector tabs expose one primary action for the current tab.
- Wind Rose branch cards do not duplicate the same CTA in a way that creates ambiguity.
- Mobile 390px keeps primary navigation and the map working area usable.
- The regression checklist covers destructive archive, undo/restore, Today empty states, large graph overview, assessment copy, Wind Rose CTA, and mobile.

## Workstreams

- `planned` - [workstreams/01-destructive-action-safety.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/01-destructive-action-safety.md)
- `planned` - [workstreams/02-today-state-and-next-step-clarity.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/02-today-state-and-next-step-clarity.md)
- `planned` - [workstreams/03-large-map-overview-and-focus.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/03-large-map-overview-and-focus.md)
- `planned` - [workstreams/04-assessment-language-and-progress-copy.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/04-assessment-language-and-progress-copy.md)
- `planned` - [workstreams/05-inspector-primary-actions-and-density.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/05-inspector-primary-actions-and-density.md)
- `planned` - [workstreams/06-campaign-windrose-mobile-polish.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/06-campaign-windrose-mobile-polish.md)
- `planned` - [workstreams/07-ux-safety-regression-qa.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/11-ux-safety-and-daily-clarity/workstreams/07-ux-safety-regression-qa.md)
