# 04 I18n Tidy

## Status

`planned`

## Goal

Fix the two truncated i18n strings the user noticed: the minimap caption ("Майнкарпа" instead of "Мини-карта") and the truncated `Перейти` button ("пер..." instead of a full label). The fix is one line per string. No new i18n keys.

## Why This Matters

The strings are visible on the canvas surface — the minimap caption is in the bottom-right, the `Перейти` button is on the canvas toolbar. The user noticed both. A polish pass that fixes the layout but leaves the strings truncated reads as half-done.

## Scope

- The i18n key for the minimap caption. The key already exists; the value just needs to be `"Мини-карта"` in full.
- The i18n key for the canvas toolbar button (the one truncated to `"пер..."`). Use the existing key, fix the value to either the full sentence or a shorter form that fits the surface without ellipsis.

Excludes:

- Translating to any language other than Russian. Russian is the only shipped language in this epic.
- Renaming the i18n keys themselves.
- Rewording any other UI copy in the app.

## Requirements

### Minimap caption

- The i18n value for the caption is the literal string `"Мини-карта"`. No ellipsis, no truncation.
- If the surface is too narrow to fit the full caption at the current font size, the fix is to either:
  - shorten the surrounding padding so the caption fits, or
  - use a smaller font size for the caption (one step down from the surface's default text size).
- Do not add a tooltip or abbreviation — the caption is the user-facing label, it must read in full.

### `Перейти` button

- The i18n value for the button label is either:
  - the full sentence `"Перейти к текущему узлу"`, if the surface fits it, or
  - a short form that fits without ellipsis, e.g. `"К узлу"` (4 chars, fits any toolbar width).
- The choice is decided in the workstream based on the surface width measurement. Do not introduce an ellipsis character in either case.
- If the surface changes width responsively, the label should re-measure and either show the long or short form. A simple CSS `text-overflow: clip` (default) is the fallback; do not use `text-overflow: ellipsis`.

## Out Of Scope

- Renaming the buttons or the i18n keys.
- Adding a tooltip with extra context.
- A full localisation audit. This is a two-string fix, not a localisation pass.

## Implementation Hints

- The minimap caption is rendered by `src/components/galaxy/galaxy-holo-minimap.ts` (or wherever the minimap caption is in the JSX). Find the i18n lookup, change the value to `"Мини-карта"`, verify it renders in full.
- The `Перейти` button is in the canvas toolbar. Find the i18n lookup, pick the long or short form, verify it renders in full.
- A quick `rg "Майнкарпа" src/` after the fix should return 0 hits.

## Done When

- `rg "Майнкарпа" src/` returns 0 hits.
- `rg '"пер\.\.\."' src/` returns 0 hits.
- The minimap caption reads "Мини-карта" in full on `desktop 1280x900`.
- The `Перейти` button reads "Перейти к текущему узлу" or a non-truncated short form, on `desktop 1280x900`.
- `npm run lint`, `npm run test`, `npm run build` are all green.
