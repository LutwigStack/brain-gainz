# 04 Node Editor Persistence

## Status

`done`

## Goal

Move `Node Editor` from a local draft layer to a fully persisted workflow:
- schema and store methods for nodes
- typed read/write contracts
- mutation API
- refresh and invalidation logic
- UI migration from local drafts to saved node data

## Scope

Includes:
- expanding the database schema and store layer for node CRUD
- new types and payload contracts for editor mutations
- create / update / archive / duplicate flows
- correct `Now` / `Map` refresh after mutations
- migrating `NavigationView` from localStorage drafts to a persisted node editor
- tests for schema, store, and editor mutation flows

Excludes:
- a new graph link editor
- bulk edit
- collaborative sync
- mobile-specific redesign

## Success Criteria

- `Node Editor` saves to the database instead of only locally
- `duplicate` and `archive` use real persisted mutations
- `Now` and `Map` see fresh data without manual reload workarounds
- the local draft fallback is no longer the main source of truth

## Workstreams

- `done` - [workstreams/01-schema-and-store-node-crud.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/04-node-editor-persistence/workstreams/01-schema-and-store-node-crud.md)
- `done` - [workstreams/02-editor-contracts-and-mutations.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/04-node-editor-persistence/workstreams/02-editor-contracts-and-mutations.md)
- `done` - [workstreams/03-ui-migration-from-local-drafts.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/04-node-editor-persistence/workstreams/03-ui-migration-from-local-drafts.md)
