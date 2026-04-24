# 07 Advanced Map Navigation And Graph Tools

## Status

`done`

## Goal

Make the graph workspace scalable after the first infinite-canvas editor milestone:
- easier navigation across a larger map
- faster layout work on groups of nodes
- richer edge semantics in the rail and graph context

## Scope

Includes:
- minimap and faster map navigation helpers
- bulk layout actions that help organize graph areas without replacing manual layout as the source of truth
- richer edge semantics in the map UI and rail
- graph-oriented shortcuts and quality-of-life improvements where they support the above

Excludes:
- collaboration
- multi-user presence
- full auto-layout as the hidden owner of node positions
- nested submaps
- graph analytics dashboards

## Product Direction

- the map stays the main workspace
- manual node placement remains the primary source of graph layout truth
- helpers may suggest or batch-update layout, but they must stay explicit user actions
- the rail should explain edge meaning more clearly than the current thin type labels

## Success Criteria

- a larger graph is easier to navigate without losing context
- users can reorganize map regions faster than pure one-node drag editing
- edge meaning becomes clearer in both canvas and rail
- the new helpers do not silently overwrite manual layout decisions

## Workstreams

- `done` - [workstreams/01-minimap-and-navigation-helpers.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/07-advanced-map-navigation-and-graph-tools/workstreams/01-minimap-and-navigation-helpers.md)
- `done` - [workstreams/02-bulk-layout-actions.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/07-advanced-map-navigation-and-graph-tools/workstreams/02-bulk-layout-actions.md)
- `done` - [workstreams/03-richer-edge-semantics-and-rail.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/07-advanced-map-navigation-and-graph-tools/workstreams/03-richer-edge-semantics-and-rail.md)
- `done` - [workstreams/04-map-shortcuts-and-qol.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/07-advanced-map-navigation-and-graph-tools/workstreams/04-map-shortcuts-and-qol.md)
