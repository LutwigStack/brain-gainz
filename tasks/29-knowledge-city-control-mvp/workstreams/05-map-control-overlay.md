# 05 Map Control Overlay

## Status

`done`

## Goal

Make the knowledge map show control over the city.

## Scope

- node visual states on map
- object/front overlay
- legend or compact state key
- large graph overview behavior

## Requirements

- Map nodes should visually distinguish:
  - unclaimed
  - scouted
  - controlled
  - fortified
  - weakened
  - contested
  - lost
- The current opponent target object should be visible.
- Route overlay and control overlay must not fight each other.
- The map must still be usable as a knowledge graph.
- Author/editing controls must remain separate from learner control states.

## Done When

- User can identify what they control and what is under threat.
- Contested nodes are easy to find.
- Large graph overview has object-level control summary.
- Mobile does not become unreadable.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
