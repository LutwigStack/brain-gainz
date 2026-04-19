# Subtask Architecture Notes: PR1 Repository Bootstrap Design

## Responsibility

- Design the storage-layer module split that PR1 implementation should follow.
- Prevent PR1 from extending the current all-in-one `src/db.js` pattern.

## Layer Classification

- `domain`: none
- `application`: none
- `infrastructure`: db bootstrap, migration runner, repository/store boundaries
- `transport`: none
- `presentation`: none
- `validation`: repository input guards and startup verification points
- `tests`: migration/bootstrap/storage regression seams

## Design Boundaries

- No runtime code is changed in this lane.
- No SQL is executed in this lane.
- No application-layer recommendation logic is designed here.

## Output Surface

- `repository-bootstrap-design.md` is the execution-facing artifact for the first PR1 code lane.
- Parent epic data contract and SQL blueprint remain upstream inputs, not duplicates.