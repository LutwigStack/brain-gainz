# 08 Performance And Zoom

## Status

`done`

## Goal

Make the atlas usable with hundreds of nodes now and ready for 1000+ nodes later.

## Scope

- canvas/SVG/Pixi rendering decision
- zoom levels
- culling/visibility rules
- label/tooltip performance
- minimap or overview
- interaction latency

## Requirements

- Target smooth interaction for 300-500 nodes in first implementation.
- Design should have a path to 1000+ nodes.
- Hide atomic node details at far zoom.
- Show domains/course hubs at far/mid zoom.
- Tooltip creation should be lazy and not render all tooltips.
- Minimap should help with regions, not just show a tiny line.
- Avoid layout jumps on zoom/focus.

## Done When

- Panning/zooming is responsive on desktop.
- Far/mid/close zoom levels are meaningful.
- Large atlas does not become unreadable text soup.
- Browser console has no render warnings/errors.



## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
