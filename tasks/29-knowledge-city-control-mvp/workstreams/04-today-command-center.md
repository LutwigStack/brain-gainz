# 04 Today Command Center

## Status

`done`

## Goal

Turn Today into the command center for city control.

## Scope

- Today view model additions
- primary object/front panel
- opponent pressure summary
- next action copy
- responsive layout

## Requirements

- Today should answer:
  - what object matters now;
  - what the opponent is targeting;
  - why pressure exists;
  - what action changes the state.
- Keep one primary CTA.
- Avoid adding a large lore paragraph.
- Show player XP and opponent XP/influence as compact race/pressure state.
- Existing Daily Run flow must remain usable.

## Example Copy

- `Соперник давит на Архив структур`
- `Причина: 2 слабых участка`
- `Следующий ход: удержать деревья поиска`
- `После зачета контроль укрепится`

## Done When

- User can understand the day's goal without reading task internals.
- Opponent pressure is visible but not the only focus.
- Mobile keeps the command center readable.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
