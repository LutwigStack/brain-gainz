# PR1 Repository Bootstrap Design

## Goal

Define how PR1 should restructure the current database bootstrap so additive migrations, legacy CRUD, and new PR1 stores can coexist without expanding `src/db.js` into a larger god file.

## Current Problem

Today `src/db.js` combines:

- database connection and singleton lifecycle;
- legacy table creation;
- default seed behavior;
- legacy subject/card CRUD.

That shape is acceptable for the current app size, but PR1 would make it collapse multiple storage concerns into one file.

## Design Principles

- one bootstrap path, many stores;
- migrations are run once during startup, not scattered across repository functions;
- legacy CRUD remains callable during coexistence;
- new PR1 stores depend on a shared database handle, not on each other;
- verification points are explicit so tests can assert startup and migration behavior.

## Recommended Module Responsibilities

### `database/bootstrap`

Owns:

- opening the SQLite connection;
- enabling FK behavior if supported;
- running legacy schema ensure step;
- invoking PR1 migration runner;
- invoking optional seed step;
- returning a ready database handle.

Does not own:

- feature CRUD queries;
- domain validation beyond startup invariants;
- recommendation logic.

### `database/legacy-schema`

Owns:

- `subjects` and `cards` table ensure logic;
- default legacy seed behavior such as inserting the first subject when needed.

Does not own:

- PR1 table DDL;
- mapping creation;
- new node hierarchy logic.

### `database/pr1-migrations`

Owns:

- ordered additive DDL for PR1 tables;
- index creation;
- startup-safe idempotent migration execution;
- startup verification that required PR1 tables exist.

Does not own:

- runtime CRUD operations;
- data backfill from legacy rows;
- recommendation logic.

### `stores/legacy-card-store`

Owns current operations around:

- `getSubjects`
- `addSubject`
- `deleteSubject`
- `getCards`
- `addCard`
- `updateCard`
- `deleteCard`

This store remains stable during PR1 and is the compatibility anchor.

### `stores/hierarchy-store`

Owns CRUD and lookup operations for:

- `spheres`
- `directions`
- `skills`
- `nodes`
- `node_actions`
- `node_dependencies`

### `stores/review-state-store`

Owns:

- loading and updating `review_states`.

### `stores/daily-session-store`

Owns:

- `daily_sessions`
- `daily_session_events`.

### `stores/legacy-mapping-store`

Owns:

- `legacy_subject_mappings`
- `legacy_card_mappings`.

## Startup Flow

Recommended bootstrap sequence:

1. call `getDatabase()` or equivalent singleton entry;
2. open/load SQLite connection if missing;
3. run `ensureLegacySchema(db)`;
4. run `runPr1Migrations(db)`;
5. run `seedLegacyDefaults(db)` only for legacy bootstrap needs;
6. return ready handle to stores.

Important posture:

- stores should never call schema creation directly;
- stores assume bootstrap already happened;
- UI code should not know whether schema creation or migrations ran.

## Singleton / Handle Strategy

- Keep one shared database handle for the frontend runtime in PR1.
- Expose a narrow `getDatabase()` helper rather than letting every store manage its own load path.
- If startup can fail, fail during bootstrap rather than lazily in random store methods.

## Seed Posture

- Keep existing default `English` subject seed as part of legacy schema/bootstrap behavior only.
- Do not auto-seed hierarchy, nodes, or mapping rows in PR1.
- Do not infer PR1 data from legacy content during bootstrap.

## Store API Posture

- Keep store APIs thin and table-oriented in PR1.
- Avoid introducing domain orchestration or recommendation logic into stores.
- Where possible, group operations by ownership boundary instead of exposing one giant grab-bag DB helper.

## Test Seams

### Bootstrap Tests

- bootstrap opens database and ensures legacy schema;
- bootstrap runs PR1 migration step idempotently;
- bootstrap leaves legacy rows intact.

### Migration Tests

- PR1 migration runner creates all required tables and indexes;
- rerunning migration runner is safe;
- startup verification fails clearly when required tables are missing.

### Store Tests

- legacy-card store behavior remains unchanged after bootstrap split;
- hierarchy/review/session/mapping stores operate only on their owned tables;
- invalid inserts fail at the expected storage boundary.

## Suggested Implementation Order

1. extract database singleton/bootstrap entry from current `src/db.js`;
2. extract legacy schema and default seed helpers;
3. add PR1 migration runner with no callers beyond bootstrap;
4. move legacy CRUD into `legacy-card-store` equivalent;
5. add empty or minimal PR1 stores matching the new ownership boundaries;
6. add storage tests around bootstrap and migration before broader app usage.

## Rollback Posture

- If PR1 store rollout fails, keep bootstrap able to serve legacy-card store only.
- Avoid deleting new modules or tables during rollback; simply stop using them.
- Do not fold extracted responsibilities back into one file during a hot fix.

## Implementation Notes For Next Lane

- First implementation can remain in frontend JS if that keeps the change smaller and testable.
- If file count starts growing too quickly, prefer small infra folders over a single oversized storage module.
- Keep naming descriptive; avoid a generic `repositories.js` catch-all.