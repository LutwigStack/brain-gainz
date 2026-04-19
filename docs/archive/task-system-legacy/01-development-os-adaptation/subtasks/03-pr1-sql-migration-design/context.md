# Subtask Context: PR1 SQL Migration Design

## Goal

Translate the PR1 data contract into an implementation-facing SQLite migration blueprint that can be turned into real migrations and storage tests without reopening product decisions.

## Inputs

- Parent epic `plan.md` and `architecture.md`.
- Parent epic `pr1-data-contract.md`.
- Existing live legacy tables `subjects` and `cards` in the current app database bootstrap.

## Why This Lane Exists

- PR1 implementation should not start from a high-level entity list alone.
- Migration order, constraint timing, index posture, and rollback behavior need their own lane.
- This keeps SQL/storage preparation separate from frontend or application-layer implementation.

## Delivered Outcome

- A SQLite-first migration design for PR1.
- Explicit DDL ordering, index plan, FK posture, and migration test hooks.
- Clear bridge from planning artifacts to eventual storage implementation.