# 04 Map Shortcuts And QoL

## Status

`done`

## Goal

Reduce friction in repeated graph editing flows.

## Scope

- keyboard shortcuts for common map actions
- cleaner helper hints in the HUD
- quick actions for selection, focus, and mode switching
- small workflow improvements that support the minimap and layout tools
- shortcut guardrails for text editing contexts and overlays

## Done When

- repeated map-editing flows take fewer clicks
- shortcuts complement the visible UI instead of hiding core actions
- shortcuts are active only when the map owns focus
- shortcuts do not fire inside `input`, `textarea`, `select`, `contenteditable`, or active text-editing overlays
- helper hints stay clear and do not overload the canvas
- the graph workspace feels faster without changing its data model
