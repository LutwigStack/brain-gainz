# 01 Learner Author Mode Boundary

## Status

`done`

## Goal

Separate learning from editing.

Learners should not see node creation, archive, raw IDs, check authoring, graph internals, or destructive actions as normal study controls.

## Scope

- define learner mode and author mode
- decide where the mode switch lives
- hide or demote author-only actions in learner mode
- protect destructive actions behind author mode and confirmation
- keep the current authoring power available, just not mixed into learning

## Learner Mode Should Show

- current campaign
- current route or next lesson
- map progress
- checks to complete
- confirmed progress
- safe navigation

## Author Mode May Show

- edit node
- create/connect/delete/archive node
- check metadata authoring
- IDs and internal details
- graph structure tools

## Done When

- a learner can use Today, Map, and Checks without seeing author-only tools
- author tools are still reachable intentionally
- destructive actions are not one-click surprises

## Implementation Notes

- Mode copy now uses learner-facing `Учусь` and author-facing `Настраиваю` labels.
- Author-only surfaces and actions are centralized in `src/components/mode-boundary.ts`.
- Learner map/check flows suppress route, graph, check metadata, raw IDs, create, archive, and edge-delete tools.
- Node archive uses the existing confirmation modal; edge delete now asks for confirmation before mutating.
- Campaign archive from the first screen also uses the boundary confirmation policy.
