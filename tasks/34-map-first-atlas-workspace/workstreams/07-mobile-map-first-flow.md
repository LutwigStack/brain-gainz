# 07 Mobile Map First Flow

## Status

`done`

## Goal

Make the atlas usable on mobile without permanent side panels.

## Scope

- mobile map viewport;
- bottom HUD;
- bottom sheet;
- route strip;
- focus/current/search actions;
- no horizontal overflow.

## Requirements

- Mobile first screen should show the map, not only headers/panels.
- Node details open as bottom sheet.
- Route strip is reachable but compact.
- Focus mode should hide app chrome where practical.
- No document-level horizontal overflow at `390x844`.

## Done When

- Mobile map does not feel like a squeezed desktop dashboard.
- User can select a node, open lesson/check, and return to map.
