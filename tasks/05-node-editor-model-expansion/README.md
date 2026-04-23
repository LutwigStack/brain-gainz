# 05 Node Editor Model Expansion

## Status

`active`

## Goal

Expand the persisted node model so the editor rail can save the fields it already presents as meaningful authoring data:
- completion criteria
- links / unlock notes
- reward / outcome notes
- a cleaner boundary between persisted node data and derived runtime context

## Scope

Includes:
- schema changes for additional editor-owned node fields
- store and typed contract updates
- read/write boundary updates for `Node Editor`
- UI migration from derived-only sections to persisted editor fields where appropriate
- tests for schema, store, boundary, and editor behavior

Excludes:
- full graph relationship editor
- collaborative editing
- bulk node editing
- map layout redesign

## Success Criteria

- `Node Editor` saves completion / links / reward-style fields to the database
- the rail no longer presents persisted-looking fields that are actually derived-only
- `Now` / `Map` stay consistent after editor mutations on the expanded model
- tests cover both persisted writes and the remaining derived-only sections

## Workstreams

- `active` - [workstreams/01-schema-for-editor-owned-node-fields.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/05-node-editor-model-expansion/workstreams/01-schema-for-editor-owned-node-fields.md)
- `planned` - [workstreams/02-boundary-and-store-contracts.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/05-node-editor-model-expansion/workstreams/02-boundary-and-store-contracts.md)
- `planned` - [workstreams/03-rail-ui-migration-to-expanded-model.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/05-node-editor-model-expansion/workstreams/03-rail-ui-migration-to-expanded-model.md)
