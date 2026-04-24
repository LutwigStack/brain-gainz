# 06 Infinite Mind Map And Graph Editor

## Status

`done`

## Goal

Turn the map into the main graph workspace:
- infinite canvas
- pan / zoom / drag
- node creation and deletion
- visual edge editing instead of freeform `links` text

## Scope

Includes:
- persisted node positions for map editing
- infinite canvas viewport state and interaction model
- direct node CRUD on the map
- visual edge CRUD with typed graph relations
- rail integration for selected node and graph context

## Model Decisions

- `nodes.skill_id` remains required
- new node creation resolves `skill_id` from the current map context:
  - first choice: currently selected node's `skill_id`
  - fallback: currently selected skill/region in the rail
  - if neither exists, creation is blocked until a target skill context is chosen
- graph structure uses one persisted source of truth:
  - extend the existing dependency model instead of introducing a second competing relation table in MVP
  - `node_dependencies` becomes the persisted graph edge model for MVP
- graph edges are directed, not undirected
- edge direction mapping in MVP:
  - `A requires B` is stored and rendered as `blocked_node_id = A`, `blocking_node_id = B`
  - visually, the directed edge points from the blocked node to the node it depends on
- allowed edge types in MVP:
  - `requires`
  - `supports`
  - `relates_to`
- self-edge is forbidden
- duplicate edge with the same `from / to / type` is forbidden
- node coordinates are persisted in world-space, not screen-space
- node coordinates are nullable during migration/backfill, but once a node receives persisted coordinates they become the source of truth
- existing derived layout is only a bootstrap/backfill mechanism
- after a node has persisted coordinates, refresh, selection changes, and viewport changes must never recompute or move it automatically
- graph truth is limited to:
  - nodes
  - node coordinates
  - edges
- viewport, selection, active mode, and rail draft remain UI/session state and must not be persisted as graph model
- node removal policy for MVP:
  - nodes are archived, not hard-deleted
  - graph edges connected to an archived node remain in the database
  - active graph reads must filter out edges whose source or target node is archived
- edge removal policy for MVP:
  - hard delete is acceptable for edges

Excludes:
- collaboration
- multi-select editing
- advanced auto-layout as the main source of truth
- nested submaps
- real-time syncing across devices

## Success Criteria

- the map works as an infinite canvas with pan and zoom
- users can create, move, and remove nodes directly on the map
- users can create and remove edges visually
- the rail stops using freeform `links` as a fake graph editor
- graph edits persist and survive refresh / selection changes
- persisted node coordinates override the old derived map layout after first save

## Workstreams

- `done` - [workstreams/01-graph-schema-and-crud.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/06-infinite-mind-map-and-graph-editor/workstreams/01-graph-schema-and-crud.md)
- `done` - [workstreams/02-infinite-canvas-viewport.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/06-infinite-mind-map-and-graph-editor/workstreams/02-infinite-canvas-viewport.md)
- `done` - [workstreams/03-direct-node-editing-on-map.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/06-infinite-mind-map-and-graph-editor/workstreams/03-direct-node-editing-on-map.md)
- `done` - [workstreams/04-visual-edge-editing.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/06-infinite-mind-map-and-graph-editor/workstreams/04-visual-edge-editing.md)
- `done` - [workstreams/05-map-polish-and-layout-helpers.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/06-infinite-mind-map-and-graph-editor/workstreams/05-map-polish-and-layout-helpers.md)
