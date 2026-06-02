# 07 Seed And Data Plan

## Status

`done`

## Goal

Plan how to seed the `NLH cash` course catalog without creating lower hand spots.

## Scope

- seed location;
- idempotent migration strategy;
- template campaign update;
- personal copy behavior;
- tests for duplicate prevention.

## Requirements

- Do not change DB schema unless strictly needed.
- Do not create atomic hand/spot nodes in this epic.
- Existing personal campaigns should not be corrupted.
- Re-running bootstrap should not duplicate courses.
- `NLH cash` should appear as a template campaign with course-level structure.

## Done When

- Implementation agents know where course catalog data lives.
- Bootstrap/migration has a safe plan.
- Tests can verify course count and stable keys.
