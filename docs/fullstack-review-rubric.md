---
tags:
  - workspace
  - governance
  - fullstack
  - review
---
# Fullstack Review Rubric

Reusable engineering rubric for end-to-end system reviews across repositories where frontend, backend, contracts, persistence, jobs, and operational behavior must be judged together.

Use it when the goal is not just local code feedback, but an honest judgment of whether the whole product slice is coherent across UI, API, domain logic, storage, failure handling, and change cost.

## Scoring Scale

Score each category from `0` to `10`.

- `0-3`: broken, dangerous, or architecturally misleading
- `4-5`: works, but engineering quality is weak
- `6-7`: acceptable working level
- `8-9`: strong engineering implementation
- `10`: exemplary and broadly reusable

## Categories

### 1. Cross-Layer Source Of Truth / Ownership

- `10`: every important product fact has one owner across UI, API, jobs, caches, and persistence
- bad signs:
  - frontend synthesizes truth that backend already owns
  - cache, job payload, and database compete as canonical state
  - different layers compute status differently

### 2. Contract Quality Across Boundaries

- `10`: frontend props/view-models, API contracts, and backend service contracts describe stable domain concepts end to end
- bad signs:
  - one-off screen DTOs leaking into backend models
  - APIs shaped around transport accidents instead of domain meaning
  - stringly typed flags or labels carrying hidden semantics

### 3. Frontend / Backend / Domain Separation

- `10`: UI renders and orchestrates, backend enforces rules, and shared contracts keep those boundaries honest
- bad signs:
  - UI owning backend-derived policy
  - handlers returning raw storage shape directly to the screen
  - domain behavior split unpredictably across browser and server

### 4. Data Model / Invariants / State Shape

- `10`: important invariants are enforced consistently in types, schemas, state machines, and write paths
- bad signs:
  - impossible or contradictory states representable in either UI state or persistence
  - frontend assumes invariants the backend does not enforce
  - schema evolution drifting away from runtime assumptions

### 5. Failure Honesty / State Machine Completeness

- `10`: loading, ready, stale, retrying, partial, failed, unavailable, and exact/non-exact states are explicit and truthful across the whole flow
- bad signs:
  - backend error rendered as "no data"
  - partial save presented as success
  - transport failure, permission failure, and absence of data collapsed into one state

### 6. Reuse / Composition / Change Locality

- `10`: the same domain and UI building blocks can move across screens, handlers, jobs, and themes without cloning behavior
- bad signs:
  - frontend variants becoming separate products
  - duplicated backend workflows per endpoint
  - changes requiring edits across unrelated layers because no clear seam exists

### 7. Concurrency / Side Effects / Consistency

- `10`: retries, duplicate delivery, optimistic updates, background jobs, and async flows reconcile honestly across client and server
- bad signs:
  - optimistic UI with no rollback or reconcile path
  - non-idempotent backend retries
  - slower async results overwriting newer user intent or newer server truth

### 8. Security / Access / Trust Boundaries

- `10`: authentication, authorization, tenant boundaries, validation, secret handling, and sensitive data exposure are explicit throughout the stack
- bad signs:
  - frontend-only gating for privileged actions
  - backend trusting caller-supplied derived fields
  - logs, responses, or analytics leaking secrets or internal state

### 9. Testability / Proof / Observability

- `10`: critical flows are proven at the right layers, and real failures can be debugged from tests plus logs/metrics/traces
- bad signs:
  - jsdom green while browser behavior is red
  - mock-only backend confidence for storage-heavy flows
  - production incidents not reconstructable from telemetry

### 10. Portability / Migration / Operational Change Cost

- `10`: the feature can survive a new container, API shape, storage backend, or deployment model without rewriting core behavior
- bad signs:
  - business rules tied to one framework or one screen
  - persistence migrations requiring manual cleanup because invariants are weak
  - product evolution blocked by tightly coupled state machines

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
   - the same fact lives in UI state, API payloads, caches, jobs, and persistence at the same time
2. `Fragile contracts`
   - props, DTOs, or service contracts describe a one-off surface instead of a stable domain concept
3. `Implicit semantics`
   - logic depends on string patterns, labels, magic values, or undocumented status combinations
4. `View/data/domain mixing`
   - rendering code owns business policy or backend code owns presentation semantics
5. `Forks instead of reuse`
   - variants or endpoint-specific clones create a second product instead of composition
6. `Illegal state representable`
   - either frontend or backend can represent contradictory states the system claims are impossible
7. `Failure dishonesty`
   - missing, failed, stale, and partial states are collapsed into a misleading "success" or "empty" story
8. `Hidden side effects`
   - hooks, services, or helpers look read-only but actually fetch, write, enqueue, mutate, or start timers
9. `Temporal coupling`
   - the system works only if events happen in one fragile order
10. `Optimistic mutation without reconcile`
    - client or server commits a visible state change without an honest rollback or correction path
11. `Transaction leakage`
    - invariants rely on multiple writes with no atomic boundary or recovery model
12. `Race conditions / stale overwrite`
    - slower async work can overwrite newer truth or newer user intent
13. `God components / god services`
    - one unit owns too many unrelated responsibilities and cannot be reasoned about locally
14. `N+1 / unbounded work`
    - query, render, or processing cost grows accidentally with size or fan-out
15. `Mock-only confidence`
    - tests stay green while real browser, storage, queue, or wire behavior is unproven
16. `Missing observability`
    - important failures or state transitions cannot be reconstructed from production telemetry
17. `Trust-boundary confusion`
    - validation, authz, tenancy, or redaction is assumed to happen elsewhere and is not enforced where needed
18. `Dead code / competing models`
    - old screens, APIs, schemas, files, or state models remain and still misrepresent how the system works

## Required Review Output

Reviews using this rubric should answer in this order:

1. `Blocking to ship`
2. `Important after ship`
3. `Cleanup / tech debt`
4. `Mandatory smell checklist`
5. `Score by all 10 categories`
6. `Overall verdict`
7. `Cross-layer migration risk / change cost`

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
Do a fullstack review using Fullstack Review Rubric.

Review the feature or system end to end across frontend, backend, contracts, persistence, async flows, and operational behavior.

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
   - cross-layer migration / operational risk
   - change cost
6. If context is missing, list assumptions explicitly.

Mandatory smells to check:
1. Duplicate truth
2. Fragile contracts
3. Implicit semantics
4. View/data/domain mixing
5. Forks instead of reuse
6. Illegal state representable
7. Failure dishonesty
8. Hidden side effects
9. Temporal coupling
10. Optimistic mutation without reconcile
11. Transaction leakage
12. Race conditions / stale overwrite
13. God components / god services
14. N+1 / unbounded work
15. Mock-only confidence
16. Missing observability
17. Trust-boundary confusion
18. Dead code / competing models

Rubric categories:
1. Cross-layer source of truth / ownership
2. Contract quality across boundaries
3. Frontend / backend / domain separation
4. Data model / invariants / state shape
5. Failure honesty / state machine completeness
6. Reuse / composition / change locality
7. Concurrency / side effects / consistency
8. Security / access / trust boundaries
9. Testability / proof / observability
10. Portability / migration / operational change cost
```

## Related

- [README.md](../README.md)
- [frontend-review-rubric.md](frontend-review-rubric.md)
- [backend-review-rubric.md](backend-review-rubric.md)
- [task-system.md](task-system.md)
- [obsidian-conventions.md](obsidian-conventions.md)
