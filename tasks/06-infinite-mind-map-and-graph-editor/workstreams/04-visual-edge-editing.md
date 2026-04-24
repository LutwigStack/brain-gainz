# 04 Visual Edge Editing

## Status

`done`

## Goal

Replace text-only `links` editing with direct graph edge editing.

## Scope

- create edge visually between nodes
- support typed edge relations
- remove edges from the map and rail
- render incoming/outgoing edge context in the rail
- define edge-creation UX contract

## Done When

- edges can be created directly on the canvas through an explicit connect flow
- connect flow defines:
  - source selection
  - target selection
  - edge type picker timing
  - cancel behavior
- edges can be deleted cleanly
- edge types are persisted
- thin edge hit targets remain usable
- the rail groups incoming/outgoing edges structurally
- the rail shows structured graph relations instead of pretending `links` text is the graph model
