# 01 Layout Rules And State Model

## Status

`done`

## Goal

Define the map workspace state model before reshaping UI.

## Scope

- focus mode state;
- drawer state;
- selected node card state;
- route strip state;
- learner/author boundary;
- keyboard exit behavior.

## Required Shape

```ts
type MapWorkspaceMode = 'default' | 'focus' | 'learning' | 'check' | 'author';
type MapDrawerState = 'closed' | 'preview' | 'lesson' | 'check' | 'mastery';

interface MapWorkspaceUiState {
  mode: MapWorkspaceMode;
  drawer: MapDrawerState;
  selectedNodeId: number | null;
  hoveredNodeId: number | null;
  routeStripExpanded: boolean;
  hudDetailsOpen: boolean;
}
```

## Requirements

- `focus` mode hides app chrome and panels.
- `learning` mode keeps map visible and opens lesson drawer.
- `check` mode opens check panel without losing selected node.
- `author` mode can keep existing heavy controls.
- `Esc` closes tooltip/drawer/focus in predictable order.
- State should not reset map camera unnecessarily.

## Done When

- Agents know which UI states exist.
- Follow-up workstreams do not invent conflicting local state.
