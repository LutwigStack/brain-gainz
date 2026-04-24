# Plan

## Intent

Replace the current semi-static map with a true graph editor on an infinite canvas.

## Product Direction

- the map is the main workspace
- nodes and edges are edited directly on the canvas
- the right rail is a property editor and inspector, not the graph editor itself
- freeform `links` text becomes optional authored context, not the source of graph structure

## Technical Direction

- `Pixi` owns canvas rendering and spatial interaction
- `React` owns editor modes, rail, toolbar, and mutation orchestration
- persisted graph state stores:
  - node coordinates
  - graph edges

## Persistence Boundaries

- persisted graph state:
  - node records
  - node world coordinates
  - graph edges
- non-persisted UI/session state:
  - viewport camera
  - current selection
  - active map mode
  - dirty rail/editor draft

## Model Decisions

- the current derived map layout is demoted to bootstrap/backfill only
- MVP does not add a second relation truth beside `node_dependencies`
- creation of a node on the map requires a resolved target `skill_id`
- archive semantics remain the default for nodes
- edge deletion is explicit and separate from node archive semantics

## Delivery Order

1. graph schema and CRUD
2. infinite canvas viewport
3. direct node editing on the map
4. visual edge editing
5. layout helpers and polish

## Risks

- mixing graph data with viewport state
- hiding persisted graph truth behind derived UI text
- overbuilding auto-layout before manual editing is reliable
- letting canvas interaction drift away from persisted refresh behavior
- letting canvas create nodes without a deterministic `skill_id` owner
