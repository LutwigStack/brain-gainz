# 07 Wind Rose Strategy View

## Status

`done`

## Goal

Make Wind Rose the strategic overview of city control.

## Scope

- object control summary in Wind Rose
- opponent target object
- strongest/weakest object list
- stat -> object -> map/action transition

## Requirements

- Wind Rose should show:
  - strongest controlled objects;
  - weakening objects;
  - contested object;
  - opponent target;
  - best next move.
- Avoid turning the screen into a text table.
- Keep radial/visual structure useful.
- Clicking an object should lead toward Map or Today action.

## Done When

- User can decide where to work next from Wind Rose.
- Opponent pressure is visible at strategy level.
- Visual hierarchy remains stronger than raw metrics.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
