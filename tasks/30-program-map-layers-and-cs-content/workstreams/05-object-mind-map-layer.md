# 05 Object Mind-map Layer

## Status

`done`

## Goal

Scope the mind-map to one selected infrastructure object.

## Scope

- object-scoped graph filtering
- route/current focus inside object
- node state overlays
- object breadcrumb
- inspector compatibility

## Requirements

- This layer is close to the current mind-map architecture.
- It should not show the full bachelor graph by default.
- It should show topics and atomic nodes inside the selected object.
- Prerequisites and route edges should remain readable.
- Control/weak/contested states should be visible when available.
- User can go back to `Город` or switch to `Папки`.
- Use `ProgramHierarchyEntry[]` and `selectedObjectKey` as the scope source.
- Do not choose object scope by scanning labels or table names inside the component.
- If route/current focus is outside the selected object, follow `ProgramMapLayerState.fallbackReason` behavior instead of silently showing the full graph.
- Author/debug free-canvas controls stay secondary and must not dominate learner mode.

## Done When

- Opening `Архив структур` shows only data-structures-related nodes.
- The user can orient inside the selected course/module.
- Today/current route focus opens the containing object and highlights the relevant node when possible.
- Large graph chaos is reduced by scoping.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
