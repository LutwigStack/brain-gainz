# Subtask Architecture Notes: PR1 SQL Migration Design

## Responsibility

- Convert the PR1 persistence contract into a migration blueprint that is concrete enough for implementation.
- Preserve additive-first behavior and legacy-card safety.

## Layer Classification

- `domain`: none
- `application`: none
- `infrastructure`: SQLite migration design, index plan, repository bootstrapping seams
- `transport`: none
- `presentation`: none
- `validation`: FK/check/uniqueness strategy for storage layer
- `tests`: migration and bootstrap verification hooks

## Design Boundaries

- No SQL files are applied in this lane.
- No repository code is written in this lane.
- No legacy tables are renamed, dropped, or structurally repurposed.

## Output Surface

- `sql-migration-design.md` is the execution-facing artifact for PR1 storage work.
- Parent epic `pr1-data-contract.md` remains the business/data contract source of truth.