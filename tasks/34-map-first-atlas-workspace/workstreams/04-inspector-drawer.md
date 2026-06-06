# 04 Inspector Drawer

## Status

`done`

## Goal

Convert the permanent learner inspector rail into a collapsible drawer.

## Scope

- right drawer on desktop;
- bottom sheet on mobile;
- collapsed selected-node chip;
- lesson/check/mastery sections;
- preserved assessment flow.

## Requirements

- Drawer closed by default in map exploration.
- Selecting a node opens preview, not full lesson by default.
- `ÐÐ°Ñ‡Ð°Ñ‚ÑŒ Ð·Ð°Ð½ÑÑ‚Ð¸Ðµ` opens lesson drawer.
- `ÐŸÑ€Ð¾Ð²ÐµÑ€ÐºÐ°` opens check drawer/panel.
- Success/fail result states from existing lesson flow must remain intact.
- Drawer must not resize the atlas unpredictably; prefer overlay or stable reserved width.

## Done When

- Map exploration no longer has a permanent full right rail.
- Lesson/check remains reachable in one click from selected node.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
