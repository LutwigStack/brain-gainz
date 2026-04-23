# 02 Boundary And Store Contracts

## Status

`planned`

## Goal

Expose the expanded node model through typed application boundaries.

## Scope

- update shared types for expanded node records and mutation payloads
- extend store and db boundaries
- refresh/invalidation support for the new fields
- mutation tests across `db` and `now-service`

## Done When

- editor mutations can read and write the new fields through one boundary
- refresh payloads stay internally consistent after writes
- tests cover save / archive / duplicate semantics on the expanded model
