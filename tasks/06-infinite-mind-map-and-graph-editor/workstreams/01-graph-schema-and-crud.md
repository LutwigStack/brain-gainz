# 01 Graph Schema And CRUD

## Status

`done`

## Goal

Introduce persisted graph data for node positions and visual edges.

## Scope

- add persisted node coordinates
- extend persisted graph edge schema from the existing dependency model
- add node and edge CRUD at store / boundary level
- define archive/delete semantics and cleanup rules
- cover graph create / update / delete semantics with tests

## Decisions To Implement

- coordinates are stored as world-space `x / y`
- backfill is required for existing nodes without coordinates
- derived layout may generate initial coordinates once, but must not overwrite saved coordinates
- edge model is directed
- edge direction mapping is explicit:
  - `requires` uses `blocked_node_id -> blocking_node_id`
  - canvas rendering must preserve that meaning instead of silently flipping edge direction
- allowed MVP edge types:
  - `requires`
  - `supports`
  - `relates_to`
- adding `relates_to` requires SQLite table recreation or equivalent migration for the existing `CHECK` constraint on `node_dependencies.dependency_type`
- self-edge is invalid
- duplicate edge with same endpoints and type is invalid
- node archive keeps connected edges in the database, but active graph reads must hide edges with archived endpoints
- edge removal is hard delete in MVP
- indexes are required on edge endpoints and type

## Done When

- nodes store `x / y` coordinates
- graph edges are persisted through one graph relation model
- node and edge CRUD work through one application boundary
- tests cover:
  - create / update / delete / archive flows
  - orphan edge prevention
  - duplicate edge prevention
  - archive node cleanup in active graph reads
  - backfill behavior for existing nodes
