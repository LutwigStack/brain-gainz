# 04 Check As Focused Flow

## Status

`done`

## Goal

Make checks feel like the main learning moment, not a hidden block inside the inspector.

## Scope

- create or reuse a focused learner check view
- show task, answer input, check button, result, and progress change
- keep authoring fields out of learner view
- explain disabled button states near the action
- show failed attempt as a normal learning result
- show confirmed progress and XP after success
- provide a clear next action after result

## Done When

- learner can complete exact, number, contains, checklist, manual, and AI-assisted checks from the focused flow
- result state is clear without reading technical labels
- check flow works on desktop and mobile

## Implementation Notes

- Learner check mode now replaces the main map canvas with a focused check flow for the selected task.
- The focused flow keeps the task, answer input, readiness message, primary check button, result state, progress lane, and XP lane in one surface.
- The inspector rail no longer duplicates the learner form while a focused check is open; it only shows context and return actions.
- Author mode keeps route, graph, check metadata, and technical details in the separated author surfaces.
