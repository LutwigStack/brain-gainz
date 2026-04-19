# Plan: PR3 Now Screen Bootstrap

## Project Goal

Transform BrainGainz into a local-first development OS with a visible recommendation loop while keeping the legacy card flow trustworthy during coexistence.

## Task Goal

Implement the first user-facing `Now` surface with a starter workspace, one primary recommendation, and a daily-session entry point.

## Implementation Checklist

- [x] Add a thin application-layer `Now` dashboard service over existing PR1 stores.
- [x] Add db-facade methods for the `Now` UI.
- [x] Introduce a visible `Now` tab without removing Library/Study.
- [x] Add starter workspace bootstrap for empty PR1 hierarchy storage.
- [x] Make `Now` the default first screen while preserving explicit access to Library/Study.
- [x] Add focused node detail, session progress, and action completion flow over the recommendation loop.
- [x] Add the remaining MVP session outcomes: `deferred`, `blocked`, and `shrunk`.
- [x] Add tests for empty state, starter workspace, blocked dependency exclusion, and session start.
- [x] Add tests for node focus and action completion lifecycle.
- [x] Add tests for defer/block/shrink event lifecycles.

## Validation Checklist

- [x] `Now` tab loads without breaking legacy Library/Study.
- [x] `Now` opens as the default first screen without blocking fallback navigation.
- [x] Empty PR1 storage shows a safe onboarding state instead of a broken blank surface.
- [x] Starter workspace creates visible recommendation data exactly once.
- [x] Starting a daily session stamps header plus `selected` event.
- [x] Completing the selected action updates session state and visible node progress.
- [x] Deferred/blocked/shrunk outcomes stamp the expected event trail and update actionable state coherently.

## Rollout/Rollback Checklist

- [x] No destructive legacy cutover was introduced; Library/Study remain reachable.
- [x] `Now` stays additive over PR1 stores and can be withdrawn without corrupting legacy data.

## Deferred Ideas / Not Tested Here

- Full recommendation scoring and richer explanation taxonomy.
- Sphere map, skill tree, and barrier/error surfaces.
- Deeper barrier/error journal surfaces beyond the event trail and node pause/shrink semantics.
- Migration helpers between legacy cards and node assets.