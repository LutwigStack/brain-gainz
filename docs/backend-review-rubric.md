---
tags:
  - workspace
  - governance
  - backend
  - review
---
# Backend Review Rubric

Reusable engineering rubric for backend-system reviews across repositories such as `poker_solver_api`, `ocr_tracker`, and backend-heavy services in the workspace.

Use it when the goal is not just style feedback, but an honest judgment of architecture quality, ownership, contracts, data boundaries, correctness, security, operability, and change cost.

## Scoring Scale

Score each category from `0` to `10`.

- `0-3`: broken, dangerous, or architecturally misleading
- `4-5`: works, but engineering quality is weak
- `6-7`: acceptable working level
- `8-9`: strong engineering implementation
- `10`: exemplary and broadly reusable

## Categories

### 1. Source Of Truth / Ownership

- `10`: every important domain fact has one owner; there are no competing truths across handlers, services, caches, queues, and persistence
- bad signs:
  - both request handlers and jobs mutating the same truth with different rules
  - cache values treated as canonical data
  - duplicate status computation in multiple modules

### 2. Contract Quality

- `10`: transport contracts, service contracts, and persistence contracts describe real domain entities or stable operations
- bad signs:
  - DTOs shaped around one endpoint instead of domain meaning
  - flags, strings, or numeric suffixes encoding hidden semantics
  - backend APIs that only work for one caller because contracts are underspecified

### 3. Transport / Domain / Persistence Separation

- `10`: handlers parse transport concerns, domain services own behavior, and repositories/gateways own I/O
- bad signs:
  - controllers performing domain decisions directly
  - SQL, HTTP, and business rules mixed in the same function
  - persistence schemas leaking directly into external API shape

### 4. Data Model / Invariants / Schema Honesty

- `10`: important invariants are enforced in types, schemas, transactions, and write paths rather than by wishful caller discipline
- bad signs:
  - nullable fields representing contradictory states
  - illegal states representable in persisted records
  - migration history that no longer matches runtime assumptions

### 5. State Machine / Failure Honesty

- `10`: pending, running, succeeded, failed, partial, stale, retrying, and unavailable states are explicit and truthful
- bad signs:
  - exceptions flattened into generic success-ish responses
  - partial writes reported as success
  - "not found", "not loaded", and "upstream failed" collapsed into one outcome

### 6. Consistency / Concurrency / Idempotency

- `10`: retries, duplicate delivery, concurrent requests, lock ordering, and stale-write risks are deliberately handled
- bad signs:
  - handlers that double-create on retry
  - write ordering that depends on lucky timing
  - side effects emitted before durable commit with no reconcile path

### 7. Security / Access Control / Trust Boundaries

- `10`: authentication, authorization, validation, and secret handling are explicit at every trust boundary
- bad signs:
  - admin-only behavior gated only in frontend or caller convention
  - raw user input flowing into queries, shell commands, or filesystem paths
  - secrets, tokens, or internal errors leaking through responses or logs

### 8. Testability And Proof

- `10`: core rules are covered by behavior-oriented tests at the right layer, with integration proof where storage, queues, or external systems matter
- bad signs:
  - mock-only confidence for database-heavy flows
  - tests asserting implementation detail instead of business behavior
  - stale tests that permanently fail, get skipped, or no longer describe the actual contract

### 9. Performance / Operability / Observability

- `10`: hot paths are bounded, expensive work is visible, and failures can be debugged from logs, metrics, and traces
- bad signs:
  - unbounded scans, fan-out queries, or N+1 behavior in normal traffic
  - background work with no progress or failure visibility
  - no structured logs around critical domain events

### 10. Change Cost / Portability

- `10`: the system can adopt a new transport, storage backend, deployment shape, or caller without rewriting domain rules
- bad signs:
  - business logic tightly coupled to framework types
  - migrations requiring hand-edited production data because invariants live only in code comments
  - changing one workflow breaks unrelated endpoints because contracts are not localized

## Verdict Bands

- `9-10`: strong engineering system
- `7-8`: good system with local debt
- `5-6`: working but fragile
- `<5`: needs corrective architecture work, not just polish

## Mandatory Smell Checklist

Every review using this rubric should explicitly check the following engineering smells.

If a smell is present, call it out as a finding.
If a smell is not present, explicitly mark it as `not found` in the smell-check section instead of silently skipping it.

### Smells To Check

1. `Duplicate truth`
   - the same domain fact lives in cache, database, job payload, response DTO, and local recomputation at the same time
2. `God handlers / god services`
   - one module knows routing, auth, validation, domain rules, persistence, and side effects all at once
3. `Fragile contracts`
   - request/response or service contracts describe a one-off caller payload instead of a stable backend operation
4. `Implicit semantics`
   - logic depends on string values, magic enum variants, filename patterns, or undocumented status combinations
5. `Transport/domain mixing`
   - controllers, HTTP handlers, RPC handlers, or queue consumers directly own business policy
6. `Persistence/domain mixing`
   - raw storage schema becomes the domain model and leaks into every layer
7. `Hidden I/O`
   - functions that look pure actually hit databases, queues, files, clocks, or remote APIs
8. `Temporal coupling`
   - the system works only if steps happen in one fragile order
9. `Non-idempotent retries`
   - repeated requests or redelivered jobs can duplicate writes or side effects
10. `Silent partial failure`
    - one subsystem fails, but the overall operation still reports success without durable compensation or visibility
11. `Transaction leakage`
    - invariants rely on multiple writes without an atomic boundary or explicit recovery model
12. `N+1 / unbounded work`
    - runtime cost grows accidentally with rows, tenants, or fan-out
13. `Missing observability`
    - critical failures or state transitions cannot be reconstructed from logs, metrics, or traces
14. `Illegal state representable`
    - types or persistence allow contradictory states that the business logic claims are impossible
15. `Stale overwrite / race condition`
    - a slower request, worker, or reconciliation pass can overwrite newer truth
16. `Mock-only confidence`
    - tests stay green while the real database, queue, transaction, or wire contract is unproven
17. `Schema drift / migration debt`
    - database shape, migrations, and runtime code disagree about what records are valid
18. `Trust-boundary confusion`
    - validation, authz, tenancy, or secret redaction is assumed to happen elsewhere and is not enforced where it matters

## Required Review Output

Reviews using this rubric should answer in this order:

1. `Blocking to ship`
2. `Important after ship`
3. `Cleanup / tech debt`
4. `Mandatory smell checklist`
5. `Score by all 10 categories`
6. `Overall verdict`
7. `Operational risk / migration risk / change cost`

For each finding, include:

- what is wrong
- why it matters
- where it lives in code
- what should be changed

For the smell checklist, include every smell from the mandatory list and mark each one as either:

- `found`
- `not found`

## Reusable Prompt

```md
Do a backend review using Backend Review Rubric.

Output format:
1. Findings first, ordered by severity:
   - Blocking to ship
   - Important after ship
   - Cleanup / tech debt
2. For each finding:
   - what is wrong
   - why it is a problem
   - where in the code it lives
   - what should be changed
3. Then include the mandatory smell checklist and mark every smell as either `found` or `not found`.
4. Then score all 10 rubric categories from 0 to 10.
5. Then provide the overall verdict:
   - current engineering maturity
   - main architectural risks
   - operational / migration risk
   - change cost
6. If context is missing, list assumptions explicitly.

Mandatory smells to check:
1. Duplicate truth
2. God handlers / god services
3. Fragile contracts
4. Implicit semantics
5. Transport/domain mixing
6. Persistence/domain mixing
7. Hidden I/O
8. Temporal coupling
9. Non-idempotent retries
10. Silent partial failure
11. Transaction leakage
12. N+1 / unbounded work
13. Missing observability
14. Illegal state representable
15. Stale overwrite / race condition
16. Mock-only confidence
17. Schema drift / migration debt
18. Trust-boundary confusion

Rubric categories:
1. Source of truth / ownership
2. Contract quality
3. Transport / domain / persistence separation
4. Data model / invariants / schema honesty
5. State machine / failure honesty
6. Consistency / concurrency / idempotency
7. Security / access control / trust boundaries
8. Testability and proof
9. Performance / operability / observability
10. Change cost / portability
```

## Related

- [README.md](../README.md)
- [frontend-review-rubric.md](frontend-review-rubric.md)
- [task-system.md](task-system.md)
- [obsidian-conventions.md](obsidian-conventions.md)
