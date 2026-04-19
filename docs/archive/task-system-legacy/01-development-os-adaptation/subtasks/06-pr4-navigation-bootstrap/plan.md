# Plan: PR4 Navigation Bootstrap

## Project Goal

Transform BrainGainz into a local-first development OS with a visible recommendation loop and browseable hierarchy surfaces while legacy card flows remain reachable during coexistence.

## Task Goal

Ship the first navigation layer with a `Map` tab, sphere map, skill tree, and read-only node screen over the existing hierarchy.

## Implementation Checklist

- [x] Add application-layer hierarchy snapshot assembly for navigation.
- [x] Add db-facade methods for the new map surface.
- [x] Introduce a visible `Map` tab alongside `Now`, `Library`, and `Study`.
- [x] Render sphere overview cards and direction/skill tree from real persisted hierarchy rows.
- [x] Render an operational node screen for the selected node.
- [x] Allow `start/complete/defer/block/shrink` directly from the selected map action.
- [x] Add regression coverage for the navigation snapshot contract.

## Validation Checklist

- [x] `Map` opens without breaking `Now`, `Library`, or `Study`.
- [x] Empty hierarchy stays safe and readable.
- [x] Navigation snapshot exposes nested sphere/direction/skill/node structure.
- [x] Node screen loads from the selected hierarchy item instead of only the recommendation queue.
- [x] Operational controls in `Map` update shared session/action state coherently.

## Rollout/Rollback Checklist

- [x] `Map` is additive and can be withdrawn without affecting the `Now` execution loop.
- [x] Hierarchy browsing reuses existing PR1/PR3 stores and did not require schema changes.

## Deferred Ideas / Not Tested Here

- Editing hierarchy directly from the map surface.
- Rich sphere-level analytics, project-specific boards, and error journal views.