# 03 Mobile Check Layout

## Status

`done`

## Goal

Make checks usable on a 390px wide mobile viewport.

## Scope

- inspect check panel inside the node inspector
- verify inputs, buttons, attempt result, XP/progress feedback
- prevent horizontal overflow
- keep the primary action visible enough
- check long Russian text wrapping

## Done When

- mobile check flow has no document-level horizontal overflow
- buttons and input text fit
- check result is visible without confusing scroll jumps

## Result

- Browser QA at 390x844 reported no document-level horizontal overflow.
- Mobile screenshots cover AI-assisted and checklist check panels.
- Long Russian button labels and helper text wrapped inside the inspector without a layout break.
