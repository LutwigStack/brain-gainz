# 03 Today Single Next Action

## Status

`done`

## Goal

Make Today answer one question:

`What should I do now?`

## Scope

- restructure Today around one main task
- show current campaign, route, and next lesson clearly
- make one primary CTA dominant
- move race/city/opponent/meters into secondary panels
- show weak spots only when they are the best next action
- remove or demote confusing duplicate CTAs
- avoid dangerous actions when no route/lesson is ready

## Done When

- Today has one obvious primary button
- user can tell why this task is next
- progress and game stats do not compete with the main action
- empty state tells the user the safe next step

## Implementation Notes

- Today hero now owns the single dominant primary action, including active daily-run and finish-run states.
- Daily-run, mini-map, and outcome controls are secondary/ghost actions so they do not compete with the hero CTA.
- Weak spots render as a separate panel only when the first available task is a recovery action.
