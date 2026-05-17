# 02 Repair Migration Path

## Status

`done`

## Goal

Make the app repair the known old local state without losing user data.

## Scope

- inspect existing migration and schema verification code
- add a targeted repair for the known missing column/state
- make the repair idempotent
- keep transaction handling safe
- log technical details for developers, not as primary UI text

## Done When

- old data boots after repair
- clean data still boots
- repeated boot does not repeat or corrupt the repair
- tests cover the repaired state

## Result

Implemented targeted rebuild repair for old `node_barrier_notes` and `node_error_notes` tables that had `source_event_id` columns without the `daily_session_events` foreign key.
