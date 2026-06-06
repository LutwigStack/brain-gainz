# 07 Map Layer Navigation And Copy

## Status

`done`

## Goal

Rename and calibrate map navigation around user intent.

## Scope

- shared `ProgramMapLayerState` contract
- route/current focus fallback behavior
- map layer tabs/switcher
- labels and empty states
- breadcrumbs
- CTA copy
- old `Свободный канвас` / `Слои` compatibility

## Requirements

- Primary layer names:
  - `Город`
  - `Карта знаний`
  - `Папки`
- Avoid technical mode names on the learner surface.
- Breadcrumb should show:
  - campaign;
  - selected object;
  - selected folder/node when relevant.
- Each layer should explain state through structure and controls, not long instructional text.
- Author/debug controls should not dominate learner navigation.
- City, mind-map, and folders must consume the same selected object/folder/node state.
- Today/current route focus must open the correct object when possible.
- If focus is outside the current object, show a compact fallback instead of silently jumping or opening the full graph.

## Required State Contract

Implement the shared state contract before building individual layer UI.

```ts
type MapLayerId = 'city' | 'knowledge_map' | 'folders';

type MapLayerFallbackReason =
  | 'route_focus_outside_object'
  | 'object_missing'
  | 'node_missing'
  | 'no_objects'
  | null;

interface ProgramMapLayerState {
  layer: MapLayerId;
  selectedObjectKey: string | null;
  selectedFolderStableId: string | null;
  selectedEntryStableId: string | null;
  selectedNodeId: number | null;
  routeFocusNodeId: number | null;
  fallbackReason: MapLayerFallbackReason;
}
```

Behavior:

- `Город -> Карта знаний` sets `selectedObjectKey`.
- `Карта знаний -> Папки` preserves `selectedObjectKey` and opens the nearest folder/container.
- `Папки -> Карта знаний` preserves the selected object and node/folder context when possible.
- route/current focus selects the containing object by default.
- if the route focus is outside the selected object, the app switches object or sets `fallbackReason: 'route_focus_outside_object'`.
- if there are no objects, the city layer shows an empty state and does not open an author canvas by default.
- learner mode hides technical `Свободный канвас` / editor controls from the primary surface.
- author/debug mode can still access old editor powers through a secondary path.

## Done When

- User understands why there are three layers.
- Switching layers does not lose selected object context.
- Today/current route focus opens the expected object/layer.
- Missing focus/object cases produce deterministic fallback states.
- Existing editor powers remain available without confusing learner flow.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
