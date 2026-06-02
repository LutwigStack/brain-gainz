# 06 Visual Folder Containers

## Status

`done`

## Goal

Replace list-like structure browsing with visual folder containers.

## Scope

- `Папки` layer
- folder/object cards
- icon/description/count/progress
- open action
- nested container navigation

## Requirements

- Do not use a plain text list as the primary view.
- Folder containers should feel closer to `Начать готовую программу` cards:
  - icon/crest;
  - title;
  - description;
  - counts;
  - state;
  - primary open action.
- Support arbitrary nested middle layers.
- Leaf/atomic nodes may be shown as smaller cards or compact entries inside a selected folder, but the primary structure view is cards.
- Preserve fast navigation.
- Use `ProgramHierarchyEntry.parentStableId` as the only folder/container tree.
- Opening a folder updates `selectedFolderStableId` and `selectedEntryStableId`.
- Switching from folders to `Карта знаний` preserves `selectedObjectKey` when the folder belongs to an object.
- Learner mode shows folders as visual containers; author/debug structure tools stay secondary.

## Done When

- User sees folders as meaningful containers, not as a table.
- Nested CS bachelor domains/modules can be opened visually.
- Folder navigation and breadcrumbs stay consistent with city and mind-map selection.
- Mobile remains usable.
