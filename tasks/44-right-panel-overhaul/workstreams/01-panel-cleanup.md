# 01 Panel Cleanup

## Status

`planned`

## Goal

Reduce the right `Занятие` panel from six blocks to three: `status`, `action`, `mastery`. Drop `Режим ученика`, `Обзор / Изучать` tab switch, `Прогресс узла`, and the `Учебный путь` block. Re-style the remaining three blocks to the targets in the epic README.

## Why This Matters

A panel that duplicates information the learner already has on the canvas is dead weight. The four dropped blocks (Режим, Обзор/Изучать, Прогресс узла, Учебный путь) are all visible elsewhere: the mode is in the app shell, the tab switch is redundant with the bottom canvas tab, the node progress is on the breadcrumb, and the route is on the canvas breadcrumb. The right panel should be where the learner decides what to do, not where they re-read what they already see.

## Scope

- the right `Занятие` panel inside `NavigationView.tsx` (the block rendered to the right of the canvas);
- the data hooks that fed the dropped blocks (the data stays in the store, only the JSX is removed);
- the `aria-labelledby` on the panel so that the new `status` heading is the accessible name.

## Requirements

### Drop

- the `Режим ученика` block (heading + description) is removed from the panel;
- the `Обзор / Изучать` tab switch is removed from the panel; the canvas-level tab strip already covers this;
- the `Прогресс узла` row (`0/100`) is removed from the panel; the breadcrumb and the canvas already carry this number;
- the `Учебный путь` block is removed from the panel; the breadcrumb and the bottom canvas strip already carry this.

### Add

- the `status` block (the new top of the panel) renders the current node title, the sphere tag, and the status word;
- the `action` block (the middle of the panel) renders the primary and the secondary button;
- the `mastery` block (the new bottom of the panel) renders the six chips; the labels are added in workstream 02.

### Layout

- the panel keeps its current width;
- the three blocks are separated by 16px;
- the panel itself has 16px of inner padding on all sides;
- the `aria-labelledby` of the panel is the id of the new `status` heading.

## Out Of Scope

- Recolor of the panel (epic 41 / 47);
- The collapse hook on mobile (out of scope for this epic; the data hook is left ready but no UI is added);
- Removing the dropped blocks from the data model (the data still exists, only the JSX is removed).

## Implementation Hints

- The panel is most likely a single JSX block in `NavigationView.tsx`; wrap the three new blocks in a `PanelContainer` component for testability.
- The dropped blocks reference store fields that are still in use elsewhere; do not remove the fields, only the JSX.
- The new `status` block reads the current node from the existing `navigationFocus` prop.

## Done When

- The panel has exactly three blocks.
- The dropped blocks are not in the panel JSX; the data they read is still in the store.
- The panel is the same width as before and is shorter (the four dropped blocks are gone).
- The accessible name of the panel is the new `status` heading.
- No regression in the existing actions.
