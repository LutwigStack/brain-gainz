# 03 Rail UI Migration To Expanded Model

## Status

`done`

## Goal

Make the right rail honest about what is persisted and what is derived.

## Scope

- wire the rail to save the new persisted fields
- keep derived runtime sections visually distinct from authored fields
- adjust duplicate/archive/save UX if the expanded model changes capabilities
- UI and integration tests for the editor rail

## Done When

- completion / links / reward fields persist from the rail
- remaining derived sections are clearly presented as derived context
- the rail remains consistent after save / duplicate / archive flows
