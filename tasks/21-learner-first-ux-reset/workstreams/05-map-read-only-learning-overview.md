# 05 Map Read Only Learning Overview

## Status

`done`

## Goal

Make the map useful for learners before it is useful for editors.

In learner mode, the map should explain:

- where I am
- what is done
- what is next
- what is locked
- how the route is ordered

## Scope

- default map to learner overview mode
- show current node and route order clearly
- show completed, available, locked, and weak nodes with distinct states
- make map click open learner details, not editor tools
- hide create/connect/delete/archive from learner mode
- add a clear entry into author mode for editing
- keep overview readable on large CS campaign

## Done When

- learner can understand route progress from the map
- editor controls do not compete with learning controls
- large graph overview stays readable enough to orient the user

## Implementation Notes

- Learner map opens as a route progress overview by default, not as a free editing canvas.
- Learner controls show route progress, current step, available, weak, locked, and completed counts.
- Route overview nodes now have distinct complete, current, weak, and locked states.
- Editor map modes and mutation tools remain behind author mode.
