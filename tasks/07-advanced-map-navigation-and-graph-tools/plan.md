# Plan

## Intent

Extend the current graph editor from a functional MVP into a workspace that stays usable as the map grows.

## Product Direction

- the canvas must support faster orientation, not only raw pan and zoom
- users should be able to clean up an area of the graph in batches when manual drag becomes too slow
- edge meaning should become more legible than the current basic type labels

## Technical Direction

- `Pixi` owns minimap rendering, viewport framing, and canvas-level graph feedback
- `React` owns helper modes, bulk actions, toolbars, and rail explanation
- persisted graph truth remains:
  - nodes
  - node coordinates
  - typed graph edges
- helper actions may update persisted node coordinates or edge metadata only through explicit mutations

## Model Decisions

- minimap is a navigation aid, not a second editor surface in MVP
- bulk layout actions remain explicit user-triggered operations
- bulk layout v1 does not introduce multi-select
- bulk layout v1 target boundary is one of:
  - current biome / region from the rail context
  - one-hop neighborhood around the focused node when a helper is explicitly scoped that way
- viewport bounds are not a layout selection source in v1
- auto-arrange helpers may write coordinates, but only when a user confirms the action
- "reversible" in v1 means preview can be cancelled before persistence
- post-apply undo/history is out of scope until a dedicated revert contract exists
- richer edge semantics may extend the existing edge model, but must not reintroduce a second graph truth beside `node_dependencies`
- richer edge semantics must define one explicit meaning matrix for:
  - outgoing copy
  - incoming copy
  - arrow meaning on canvas
  - whether a relation is user-facing directed or user-facing associative
- keyboard shortcuts and quick actions must stay additive and not replace visible UI affordances
- shortcuts are active only when map focus owns interaction
- shortcuts must be ignored inside `input`, `textarea`, `select`, `contenteditable`, and active text-editing overlays

## Delivery Order

1. minimap and navigation helpers
2. bulk layout actions
3. richer edge semantics and rail explanation
4. shortcuts and quality-of-life polish

## Risks

- turning helper actions into hidden auto-layout
- making the minimap visually noisy without enough utility
- adding richer edge semantics without clear copy in the rail
- increasing canvas complexity faster than users can understand the controls
