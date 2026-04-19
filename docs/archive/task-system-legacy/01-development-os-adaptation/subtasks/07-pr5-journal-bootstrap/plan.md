# Plan: PR5 Journal Bootstrap

## Project Goal

Transform BrainGainz into a local-first development OS with executable node workflows and inspectable feedback surfaces for barriers and work adjustments.

## Task Goal

Ship the first actionable journal layer that aggregates blocked/shrunk/deferred outcomes into barrier and error surfaces, and persist that context at the node level.

## Implementation Checklist

- [x] Add application-layer journal aggregation over existing session events.
- [x] Add db-facade access for journal snapshot loading.
- [x] Introduce a visible `Journal` tab alongside `Now`, `Map`, `Library`, and `Study`.
- [x] Render barrier summary, hotspot list, barrier log, and adjustment log.
- [x] Deep-link journal entries back into the `Map` node screen.
- [x] Make journal entries actionable: open remediation or create follow-up steps directly.
- [x] Persist barrier and error notes at the node level so the journal no longer depends only on session event notes.
- [x] Add regression coverage for journal snapshot aggregation.
- [x] Add regression coverage for persistent note persistence and journal follow-up creation.

## Validation Checklist

- [x] `Journal` opens without breaking the existing tabs.
- [x] Empty journal state is safe and readable.
- [x] Blocked outcomes aggregate under their barrier types.
- [x] Shrunk/deferred outcomes appear in an adjustment-oriented surface.
- [x] Journal entries can route the user back to the relevant node screen.
- [x] Journal entries can create follow-up remediation steps without leaving the surface.
- [x] Node screens expose persistent barrier/error notes separate from the raw event trail.

## Rollout/Rollback Checklist

- [x] `Journal` is additive and can be withdrawn without affecting session execution.
- [x] PR5 keeps schema changes additive: journal aggregation now uses persistent node note tables without mutating legacy card data.

## Deferred Ideas / Not Tested Here

- Dedicated barrier resolution workflows.
- Rich analytics over barrier trends, remediation success, or node relapse.
- Explicit note resolution/closure flows for old barrier or error notes.