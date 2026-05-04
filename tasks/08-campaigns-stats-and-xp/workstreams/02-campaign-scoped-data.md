# 02 Campaign Scoped Data

## Status

`planned`

## Goal

Make campaign the hard data boundary for visible work.

## Scope

- add campaign ownership to structures, skills, nodes, graph edges, focus state, and progress records where needed
- audit every current persisted table and decide one of:
  - direct `campaign_id`
  - scoped through parent foreign key
  - intentionally global with written reason
- migrate existing data into the developer main campaign
- filter all reads by selected campaign
- make all mutations write into selected campaign
- prevent cross-campaign data from appearing in `Now`, `Map`, `Wind Rose`, tree, rail, and editor

## Required Data Audit

Cover at least:
- structures / spheres / directions / skills
- nodes
- node graph edges
- node actions
- review state
- daily sessions
- daily session events
- notes / summaries / editor fields
- current focus / selection state
- legacy subjects, cards, and mappings
- map view state where persisted

## Model Decisions

- campaign-scoped reads must be explicit
- selected campaign is required before opening app work tabs
- old data becomes part of the developer main campaign during migration
- campaign switching must refresh all dependent state
- migration must be idempotent:
  - re-run does not create another developer main campaign
  - old rows attach to the same campaign boundary
  - orphan rows are rejected or logged
  - partially migrated databases can resume safely

## Done When

- switching campaign changes visible map, tree, stats, focus, and `Now`
- new nodes and edges belong to selected campaign
- no data from another campaign leaks into the current view
- old single-campaign data still loads after migration
- actions, sessions, review/progress state, notes, and legacy data cannot affect another campaign
- a migration re-run leaves the same campaign ids and row counts
