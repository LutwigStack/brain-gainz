# 01 Focused Lesson Screen

## Status

`done`

## Goal

Make the lesson/check screen feel like the main learning surface.

The current check can still visually live beside the map/task overview. The learner should feel they are in a lesson, not in a graph editor workspace.

## Scope

- create or adapt a focused learner lesson layout
- make task prompt, answer input, check action, result, and next step the main content
- move map/route overview behind secondary actions
- keep lesson context visible: campaign, route, node title
- keep result feedback visible: passed/failed, XP/progress effect, next action
- preserve existing assessment behavior and Daily Run completion

## Done When

- `Начать занятие` opens a focused lesson/check screen when a check is available
- map is not a dominant neighboring panel during the check
- failed and passed result states are readable without scrolling through map UI
- tests cover routing and state preservation
