# 01 Top Cards Removal

## Status

`planned`

## Goal>

Replace the stacked top context (program / specialization cards, `Карта задач` header, context chips, action row) with a single compact HUD row.

## Why This Matters

On `desktop 1280x900` the area above the atlas canvas is `~250px` of stacked cards. The atlas is the product; the chrome around it is not. The `layout-rules.md` from epic 34 already calls for "HUD instead of header stack" (rule 3) and "no permanent full right rail in learner map view" (rule 2). The right inspector is already collapsed in epic 34; the top chrome is not.

## Scope

- the atlas workspace layout in `NavigationView.tsx:4765+`;
- the top program / specialization cards visible on `10-readability-atlas-desktop.png` from epic 31;
- the `Карта задач` header with description and `Скрыть детали / Обновить` actions;
- the context chips row (`Сейчас`, `Дальше`, `Этап`);
- the second action row (`Обзор / К текущему`);
- the section tabs (`Город / Карта знаний / Папки`).

## Requirements

### Default state

- top HUD is a single row, `~56px` tall;
- left content: program chip (`Программа · <title>`), separator dot, current sphere label, separator dot, current step label (truncated);
- right content: action buttons in this order — `Вся карта`, `К текущему`, `Фокус`;
- the section tabs (`Город / Карта знаний / Папки`) move to a small left rail above the canvas, not stacked vertically;
- the context chips (`Сейчас`, `Дальше`, `Этап`) are removed from the default state; their data is carried by the bottom route strip (epic 36) and the step indicator (epic 37);
- the description copy (`Среда программирования · Бакалавриат по информатике / ...`) is hidden in the default state and revealed on a "details" toggle.

### Details toggle

- a small `…` button at the right end of the HUD expands the description and the context chips inline below the row;
- the toggle is collapsed by default.

### Behavior

- the layout must remain usable at `1280x900` without horizontal scroll;
- the atlas canvas must occupy `>= 70%` of the vertical space (target rule from `layout-rules.md:7-11`);
- the right inspector stays collapsed by default (verified by epic 34 workstream 04).

## Out Of Scope

- Changing the right inspector behavior.
- Mobile layout (handled by epic 38 workstream 03).
- Removing the `Скрыть детали / Обновить` actions from any other workspace (this epic is atlas‑only).

## Implementation Hints

- Introduce a small `AtlasTopHud` component that renders the compact row.
- The section tabs can use a vertical icon strip on the left edge of the canvas, similar to the existing left app rail but narrower.
- The "details" toggle uses an existing `useState` hook; do not introduce a global store for this.

## Done When

- Atlas workspace top chrome fits in one row by default.
- Atlas canvas is the largest object on `desktop 1280x900`.
- The details toggle reveals the description and context chips inline.
- No regression in focus mode or right inspector behavior.
- Visual test screenshot stored under `qa/`.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
