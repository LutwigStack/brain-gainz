# 01 Reproduce Old Storage Failure

## Status

`done`

## Goal

Capture the dirty local database failure in a repeatable way.

## Scope

- reproduce the `node_barrier_notes.source_event_id` schema failure
- record browser, URL, commit, and visible error
- identify whether the failure happens before or after app boot
- identify the table/schema mismatch
- preserve enough data or steps to build a regression fixture

## Output

Create:

`tasks/18-local-data-recovery/old-storage-failure-notes.md`

## Done When

- another agent can reproduce or simulate the failure
- the failing schema/state is known
- the next workstream can implement repair without guessing

## Result

Captured in [../old-storage-failure-notes.md](C:/Users/Andr3y/projects/javascript_projects/brain-gainz/tasks/18-local-data-recovery/old-storage-failure-notes.md).
