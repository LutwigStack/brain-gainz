# 01 Trust And Error Boundaries

## Status

`planned`

## Goal

Remove raw persistence / transaction failures from core user flows and fix the broken assessment and route action paths.

## Scope

- fix `cannot rollback - no transaction is active`
- fix failed assessment attempt persistence
- fix or guard `Today` route start / route action when no valid route exists
- keep domain errors user-facing and implementation errors console-only
- ensure error banners do not expose SQL / rollback language
- keep browser console clean for covered flows

## User-Facing Problems

- `Не прошел` can look like an application crash.
- `Маршрут` can be clicked in a state where it cannot produce a useful route flow.
- The UI shows raw transaction text instead of an actionable state.

## Done When

- submitting a failed assessment attempt no longer shows raw SQL / rollback text
- submitting a passed assessment with valid evidence no longer shows raw SQL / rollback text
- `Today` route action is not clickable when it cannot do useful work, or it redirects to a clear route-building action
- console has no `Failed to submit assessment attempt` for the covered assessment flow
- console has no `Failed to start specialization` for the covered route flow
- persistence behavior is covered by a test or a documented manual QA case

## High-Risk Scenarios

- sql.js transaction rollback behavior
- nested transaction / rollback handling in `now-service`
- route start with no active specialization route
- failed assessment attempt storage
- UI error banner mapping from thrown errors

