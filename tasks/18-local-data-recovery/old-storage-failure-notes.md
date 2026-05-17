# Old Storage Failure Notes

## Failure

Dirty browser storage could block app startup during PR1 schema verification:

`PR1 migration verification failed: table "node_barrier_notes" is missing a foreign key for "source_event_id"`

The same clean profile booted successfully, so the failure was tied to persisted local SQLite data in browser `localStorage`, not the current clean bootstrap path.

## Cause

Older local databases could already contain `node_barrier_notes` and `node_error_notes` with a `source_event_id` column but without the foreign key to `daily_session_events`.

The migration used `CREATE TABLE IF NOT EXISTS`, which does not alter an existing table. Verification then correctly rejected the old table because the required foreign key was missing.

## Reproduction Fixture

The regression test now simulates the dirty state by:

1. Bootstrapping a current database.
2. Creating session events plus barrier/error notes linked through `source_event_id`.
3. Rebuilding both note tables into the old shape without the `source_event_id` foreign key.
4. Running bootstrap again.

The fixed bootstrap repairs the schema and keeps both notes.
