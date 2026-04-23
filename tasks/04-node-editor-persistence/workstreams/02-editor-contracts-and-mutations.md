# 02 Editor Contracts And Mutations

## Status

`done`

## Goal

Lift persisted node CRUD into a typed application boundary.

## Scope

- new types in `src/types/app-shell.ts`
- new methods in `src/db.ts`
- mutation payload/result contracts
- invalidation and refresh orchestration for `Now` and `Map`

## Done When

- UI can consume a typed editor API instead of draft-only helpers
- all editor mutations go through one boundary
- snapshots and focus stay in sync after mutations
