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
