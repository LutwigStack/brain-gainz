# Subtask Context: PR1 Repository Bootstrap Design

## Goal

Define how the current `src/db.js` bootstrap and CRUD surface should split into migration runner, database bootstrap, and PR1 repository/store seams before real implementation starts.

## Inputs

- Parent epic `plan.md` and `architecture.md`.
- Parent epic `pr1-data-contract.md`.
- SQL blueprint from `../03-pr1-sql-migration-design/sql-migration-design.md`.
- Current live bootstrap/CRUD surface in `src/db.js`.

## Why This Lane Exists

- Current `initDb()` mixes connection, schema creation, seed logic, and legacy CRUD entry.
- Writing migrations first without a bootstrap split would keep new PR1 logic trapped in the same monolith.
- PR1 implementation needs clear ownership boundaries for stores and migration startup.

## Delivered Outcome

- A concrete repository/bootstrap design for PR1.
- Explicit module responsibilities and startup sequence.
- Clear test seams for migration and storage regression work.