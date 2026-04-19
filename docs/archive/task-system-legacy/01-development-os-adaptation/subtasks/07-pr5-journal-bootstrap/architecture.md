# Subtask Architecture Notes: PR5 Journal Bootstrap

## Responsibility

- Convert session outcomes into inspectable product surfaces.
- Reuse the existing event store; do not introduce new journal tables in this bootstrap slice.
- Keep the journal read-only and navigational, with deep links back into `Map`.

## Layer Classification

- `domain`: none
- `application`: journal aggregation, barrier parsing, hotspot ranking
- `infrastructure`: reuse `daily_session_events`, `daily_sessions`, and node/action joins
- `transport`: none
- `presentation`: `Journal` tab, barrier summary, hotspot list, barrier log, adjustment log
- `validation`: safe empty states when no outcome incidents exist yet
- `tests`: journal snapshot aggregation regression coverage

## Design Boundaries

- No new schema.
- No editable remediation plans yet.
- No standalone error-note capture separate from outcomes yet.
- No predictive analytics or scoring beyond simple aggregation.

## Output Surface

- Read-only journal layer that turns blocked/shrunk/deferred outcomes into reusable operational context.