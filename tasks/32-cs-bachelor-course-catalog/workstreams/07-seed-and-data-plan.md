# 07 Seed And Data Plan

## Status

`done`

## Goal

Plan how to seed the course catalog and remove/isolate old low-level template nodes without creating new bottom nodes.

## Scope

- seed location;
- idempotent migration strategy;
- template campaign update;
- personal copy behavior;
- tests for duplicate prevention.
- cleanup migration for old CS template nodes.

## Requirements

- Do not change DB schema unless strictly needed.
- Do not create hundreds of atomic nodes in this epic.
- Existing personal campaigns should not be corrupted.
- Re-running bootstrap should not duplicate courses.
- Existing `Бакалавриат по информатике` content should be reconciled, not blindly replaced.
- Existing low-level CS template nodes should not remain visible on the main learner surface.
- If old low-level nodes are required for QA, move them to a separate fixture/template.
- Bootstrap must not recreate removed old nodes.

## Done When

- Implementation agents know where course catalog data lives.
- Bootstrap/migration has a safe plan.
- Tests can verify course count and stable keys.
- Tests can verify old low-level template nodes are gone or isolated.
