# 06 Route Mastery Opponent Overlays

## Status

`done`

## Goal

Layer route, mastery, review decay, and opponent pressure over the atlas without flattening it.

## Scope

- route overlay
- current/next/completed route styling
- mastery/verified state
- self-marked state
- weak/review state
- contested/opponent pressure state
- boss/checkpoint state

## Requirements

- Route is an overlay, not the base layout.
- Current node is the strongest highlight.
- Next few route nodes are visible but quieter.
- Completed route nodes show verified path without turning all links bright.
- Weak/contested states remain visible even when not on route.
- Opponent pressure should work at node, course, and region levels.
- Boss nodes should feel like major gates/checkpoints.

## Done When

- User can see where to go next.
- User can see what is decaying or contested.
- User can see what is already verified.
- The map still reads as a branching atlas.



## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
