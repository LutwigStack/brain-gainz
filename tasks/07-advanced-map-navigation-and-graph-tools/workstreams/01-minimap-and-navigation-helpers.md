# 01 Minimap And Navigation Helpers

## Status

`done`

## Goal

Make a larger map easier to read and navigate without changing graph truth.

## Scope

- minimap surface for orientation
- viewport framing inside the minimap
- click-to-jump or drag-to-recenter navigation in the minimap
- fit-to-selection / focus-on-node style helpers where they are already supported by current selection state

## Done When

- the user can see where the current viewport sits inside the wider graph
- the minimap is useful on larger graphs and not just decorative
- navigation helpers reduce pan/zoom thrash during editing
- viewport navigation remains in-session UI state and does not persist into graph data
