# 02 Compact Map HUD

## Status

`done`

## Goal

Replace stacked map header/cards with one compact HUD.

## Scope

- campaign/layer/current object row;
- current route node chip;
- focus/current/search actions;
- details disclosure;
- removal of repeated metadata.

## Requirements

- HUD should fit in one row on desktop when possible.
- Avoid repeating campaign/specialization data already visible in app shell.
- Current step should be visible but compact.
- Details should expand on demand.
- HUD must not push the canvas far below the fold.

## Done When

- Atlas appears higher and larger on first viewport.
- Top map chrome no longer feels like stacked cards.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
