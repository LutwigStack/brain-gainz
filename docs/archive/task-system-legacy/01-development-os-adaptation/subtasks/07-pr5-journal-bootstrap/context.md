# Subtask Context: PR5 Journal Bootstrap

## Goal

Turn session outcomes into explicit barrier/error journal surfaces instead of leaving them as a flat event stream.

## Inputs

- Parent epic `plan.md` and `architecture.md`.
- Operational `Now` and `Map` surfaces already shipping `blocked` and `shrunk` outcomes.
- Existing `daily_session_events` persistence with outcome notes.

## Why This Lane Exists

- MVP requires error-aware operational surfaces, not only execution controls.
- `blocked` and `shrunk` now carry meaningful notes and barrier labels, but the user still lacks a dedicated place to review them.
- The thinnest next slice is a read-only journal layer over existing events, not new schema or a full remediation workflow.

## Delivered Outcome

- A visible `Journal` tab.
- Barrier summary cards.
- Hotspot list for repeated friction nodes.
- Barrier and adjustment logs that deep-link back into node navigation.