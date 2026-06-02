# 05 Tooltip And Inspector

## Status

`done`

## Goal

Move node meaning out of the canvas label and into tooltip/inspector.

## Scope

- hover tooltip
- keyboard focus tooltip
- selected node inspector
- compact node summary
- check/assessment entry point
- mobile selected-node sheet

## Requirements

- Tooltip opens on hover and keyboard focus.
- Tooltip must be readable and compact.
- Tooltip shows:
  - title;
  - short description;
  - status;
  - prerequisite summary;
  - mastery/XP;
  - main action.
- Selected inspector shows full lesson/check flow.
- Failed/pass states should still use the improved assessment result UI.
- Tooltip must not cover the current node in a way that breaks navigation.
- Mobile uses tap-to-select and a bottom sheet/details panel.

## Done When

- Normal nodes can have no visible labels.
- User can understand any node through hover/focus/tap.
- Keyboard user can inspect nodes.
- Mobile user can inspect nodes without horizontal overflow.

