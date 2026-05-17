# 04 Regression Tests

## Status

`done`

## Goal

Prevent old local data failures from coming back.

## Scope

- add a fixture or simulated old schema case
- test automatic repair
- test clean boot
- test unrecoverable error mapping
- keep tests deterministic and fast

## Done When

- targeted tests fail without the repair
- full test suite passes
- lint and build pass

## Result

Added a deterministic old-schema test that strips the `source_event_id` foreign keys from node note tables, runs bootstrap, and verifies schema repair plus note preservation.
