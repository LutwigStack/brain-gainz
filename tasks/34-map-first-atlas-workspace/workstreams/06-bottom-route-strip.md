# 06 Bottom Route Strip

## Status

`done`

## Goal

Move route/current-step context into a compact bottom strip.

## Scope

- current node;
- next route nodes;
- weak/review indicators;
- boss/checkpoint markers;
- jump-to-current action.

## Requirements

- Strip is compact by default.
- It can expand, but should not become a large panel.
- Current node is obvious.
- Next 3-5 steps are available.
- Clicking a step focuses it on the atlas.
- Route strip should not duplicate the right drawer.

## Done When

- Current route is always findable.
- Top header no longer needs long route chips.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
