# Plan: PR1 SQL Migration Design

## Project Goal

Transform BrainGainz into a node-centered development OS without breaking the current local-first legacy card workflow.

## Task Goal

Produce an implementation-facing SQL migration design for PR1 covering DDL ordering, indexes, constraints, rollback posture, and migration test hooks.

## Implementation Checklist

- [x] Define migration objectives and non-goals.
- [x] Define table creation order and transaction posture.
- [x] Define FK/check/uniqueness strategy for SQLite.
- [x] Define index plan for expected PR1 access paths.
- [x] Define rollback and migration test posture.

## Validation Checklist

- [x] Migration design stays additive-first.
- [x] Legacy `subjects` and `cards` remain untouched.
- [x] DDL order supports FK creation without relying on destructive rebuilds.
- [x] Test hooks are explicit enough for later red/green implementation.

## Rollout/Rollback Checklist

- [x] Documentation-only lane; no runtime rollout.
- [x] Future SQL implementation must be reversible by ignoring new tables rather than mutating legacy tables.

## Deferred Ideas / Not Tested Here

- Exact SQL file layout and naming convention in source code.
- Repository API surface names and module boundaries.
- PR2 storage changes for recommendation inputs beyond PR1 tables.