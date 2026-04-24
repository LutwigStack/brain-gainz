# 01 Schema For Editor-Owned Node Fields

## Status

`done`

## Goal

Add persisted schema support for the extra node fields the rail treats as authored content.

## Scope

- database migration for completion criteria / links / reward-style fields
- bootstrap and schema verification updates
- store-level read/write support
- migration safety for existing nodes

## Done When

- the database stores the new editor-owned node fields
- old workspaces migrate cleanly
- store reads and writes cover the new fields
- schema tests cover bootstrap and migration paths
