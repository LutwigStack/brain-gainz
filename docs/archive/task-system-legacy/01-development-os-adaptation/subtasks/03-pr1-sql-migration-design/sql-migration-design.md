# PR1 SQL Migration Design

## Goal

Provide a SQLite-first migration blueprint for PR1 so storage implementation can proceed deterministically from the approved data contract.

## Migration Objectives

- create all PR1 additive tables;
- preserve existing `subjects` and `cards` data unchanged;
- make new hierarchy/session/review/mapping tables bootstrappable on existing user databases;
- support later repository split without requiring schema redesign.

## Explicit Non-Goals

- no destructive data migration;
- no automatic population of new tables from legacy rows;
- no recommendation-engine tables beyond the PR1 contract;
- no barrier or error tables yet.

## Migration Posture

- Use additive `CREATE TABLE IF NOT EXISTS` statements.
- Execute migration inside a transaction when the plugin/runtime allows atomic DDL for the full batch; if not, keep each table idempotent and safe for repeated startup execution.
- Ensure `PRAGMA foreign_keys = ON` is active before validation-sensitive operations.
- Treat legacy tables as immutable inputs during this lane.

## Recommended Creation Order

1. `spheres`
2. `directions`
3. `skills`
4. `nodes`
5. `node_actions`
6. `node_dependencies`
7. `review_states`
8. `daily_sessions`
9. `daily_session_events`
10. `legacy_subject_mappings`
11. `legacy_card_mappings`

Rationale:

- hierarchy owners are created before dependents;
- session/event tables come after node/action anchors;
- legacy mapping tables come last because they point both to legacy rows and new hierarchy rows.

## Table Strategy

### Hierarchy Tables

- `spheres`, `directions`, `skills`, `nodes`, `node_actions` use straightforward PK/FK ownership.
- Add uniqueness constraints at the narrowest ownership boundary:
  - `spheres.slug`
  - `directions(sphere_id, slug)`
  - `skills(direction_id, slug)`
  - `nodes(skill_id, slug)`
- Keep `is_archived` as integer flags rather than splitting active/archive tables.

### Dependency Table

- `node_dependencies` enforces:
  - uniqueness on `(blocked_node_id, blocking_node_id, dependency_type)`;
  - check preventing self-dependency.
- Do not attempt cycle detection at SQL level in PR1; handle that later in validation/application layers.

### Review State Table

- `review_states` remains one-row-per-node.
- `review_profile` stays soft-constrained in this lane; strict enum hardening can happen when the implementation confirms actual profiles needed.
- `current_risk` should use a check aligned to `low|medium|high` if the implementation prefers hard enum checks.

### Daily Session Tables

- `daily_sessions` is the durable header.
- `daily_session_events` stores the minimal event set and should require at least one of `node_id` or `action_id`.
- Do not enforce a unique session per day in SQL yet unless implementation decides the product truly forbids multiple sessions on one date.

### Legacy Mapping Tables

- `legacy_subject_mappings` and `legacy_card_mappings` are the only bridge between legacy and new models in PR1.
- Each legacy row may have at most one active mapping row in PR1, represented by unique `legacy_subject_id` and unique `legacy_card_id`.
- Mapping status and mapping decider should use constrained text values.

## Constraint Strategy

### Foreign Keys

- Use FK constraints for all new-table ownership relations.
- Use FK constraints from mapping tables to legacy tables if supported reliably by the runtime bootstrap path.
- If FK enforcement against legacy tables is operationally fragile in the current plugin flow, keep the columns and validate referential integrity in tests plus repository guards.

### Check Constraints

- Add checks where SQLite can enforce stable, low-risk invariants:
  - `blocked_node_id != blocking_node_id`
  - constrained text enums for stable fields such as `node.type`, `node.status`, `session_event_type`
  - session event must reference node or action or both
- Avoid overly complex checks that make iterative migration harder.

### Uniqueness

- Prefer explicit `UNIQUE` constraints in table DDL rather than relying only on secondary indexes.
- Slug uniqueness should be scoped to the parent owner, not globally except for `spheres.slug`.

## Index Plan

Create indexes aligned to early PR1/PR2 access patterns.

### Required Indexes

- `directions(sphere_id, sort_order, id)`
- `skills(direction_id, sort_order, id)`
- `nodes(skill_id, status, is_archived, id)`
- `node_actions(node_id, status, sort_order, id)`
- `node_dependencies(blocked_node_id)`
- `node_dependencies(blocking_node_id)`
- `review_states(next_due_at)`
- `review_states(current_risk)`
- `daily_sessions(session_date, status)`
- `daily_session_events(session_id, occurred_at)`
- `legacy_subject_mappings(mapping_status)`
- `legacy_card_mappings(mapping_status)`

### Optional Later Indexes

- `nodes(last_touched_at)` if recommendation reads prove it hot;
- `node_actions(due_at)` if action due sorting becomes hot in PR2;
- composite indexes on `review_states(node_id, next_due_at)` if review joins become hot.

## Bootstrap Sequence In App Code

Target runtime shape for later implementation:

1. open database;
2. enable FK enforcement if supported;
3. create legacy tables as today if missing;
4. run additive PR1 migration batch;
5. verify presence of required new tables;
6. continue normal startup.

This order ensures existing users keep a bootable app even before any new UI uses the new tables.

## Rollback Posture

- Rollback for PR1 is logical, not destructive: stop reading/writing new tables and return to legacy flows.
- Do not drop newly created tables during rollback.
- Do not mutate or backfill legacy tables as part of rollback.

## Migration Test Hooks

### Red Tests To Prepare

- existing bootstrap does not create PR1 hierarchy/session/mapping tables;
- existing bootstrap has no guarantee that legacy rows survive additive migration unchanged;
- existing bootstrap has no constraint against invalid node dependency self-links.

### Green Tests To Expect Later

- migration creates every PR1 table idempotently;
- legacy `subjects` and `cards` row counts remain unchanged after migration;
- FK/unique/check constraints reject representative invalid inserts;
- rerunning bootstrap does not duplicate schema objects or corrupt existing rows.

## Implementation Notes For Next Lane

- Keep actual SQL close to the current DB bootstrap location first; repository split can happen in the same PR if it stays inside PR1 scope.
- If the current SQL plugin has quirks around multi-statement execution, prefer smaller ordered statements with explicit error capture.
- Capture schema versioning explicitly if the implementation introduces a migration ledger; otherwise keep the startup bootstrap idempotent and deterministic.