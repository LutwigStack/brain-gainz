# ADR-0001: MVP Product Decisions For Development OS Adaptation

## Status

Accepted

## Context

BrainGainz is being adapted from a card-centric study app into a local-first personal development operating system. The target product must answer three questions at all times:

- what to do now;
- why this is the right thing now;
- what starts degrading or blocking future progress if it is skipped.

The approved MVP must stay implementable within the current React + Vite + Tauri + SQLite baseline, avoid rewrite-from-scratch behavior, and keep legacy card flows reachable during migration.

## Decision Drivers

- recommendation usefulness matters more than breadth of feature inventory;
- product logic must remain explainable, not black-box;
- migration must be additive-first;
- cards should survive the transition without remaining the root abstraction;
- habits, learning nodes, cards, and projects need different operational semantics;
- MVP must avoid oversized modeling and premature subsystem proliferation.

## Considered Options

### Option 1: Unified Generic Logic Everywhere

- Pros: smallest schema surface on paper, easiest to describe initially.
- Cons: conflates learning decay, habit stability, and project freeze into one weak abstraction; harms recommendations and explainability.

### Option 2: Product-Type-Specific Contracts With MVP-Level Simplicity

- Pros: keeps behavior honest by node type while preserving a shared node model; supports explainable recommendations and additive migration.
- Cons: requires slightly richer domain contracts and a few more decision tables.

### Option 3: Full Specialized Subsystems For Cards, Projects, Habits, Sessions, And Errors

- Pros: maximal expressiveness and future flexibility.
- Cons: excessive for MVP; creates scope-creep and implementation drag before the core loop is validated.

## Decision

Adopt Option 2.

Use a shared node-centered product model with explicit MVP-level type-specific rules for decay/drift, sessions, cards, projects, barriers, errors, explainability, and rhythm.

## Accepted Decisions

### 1. Knowledge Decay / Drift

- Base model: `due-date + risk(low|medium|high)`.
- Logic varies by node type.
- Learning nodes derive risk from elapsed time, repeated errors, and node importance.
- Cards may keep current or separate review logic during migration.
- Habit nodes track streak break / weakening stability rather than knowledge decay.
- Project nodes track context loss / freeze risk rather than pure forgetting.

### 2. Daily Session

- Use a durable session header plus minimal outcome events.
- Accepted MVP outcome events:
  - `selected`
  - `completed`
  - `deferred`
  - `blocked`
  - `shrunk`
- Full event log is deferred.

### 3. Cards And Migration

- Primary migration strategy is assisted migration.
- Legacy archive remains available.
- Automatic migration is allowed only for the most obvious low-risk cases.
- In the new system, cards become node-attached learning assets rather than the app-wide root abstraction.

### 4. Projects

- Projects exist as `project` node types in MVP.
- A separate project surface is deferred until the core loop is proven.
- First-wave implementation priority remains:
  - `Now` screen
  - node screen
  - daily session
  - errors
  - basic review

### 5. Barriers

- Barrier capture uses a small typed taxonomy plus optional note.
- MVP barrier types:
  - too complex
  - unclear next step
  - low energy
  - aversive or scary to start
  - wrong time or wrong context

### 6. Errors As Recommendation Inputs

- Errors are control signals, not passive history.
- Repeated errors raise node priority.
- Error evidence may trigger a simpler next step.
- Missing-foundation signals may raise dependencies.
- Oversized actions may be split when barriers/errors indicate step size is the problem.

### 7. Explainability

- Recommendation layer must always explain why a step is primary now.
- Minimum reason set exposed to the UI:
  - long time untouched
  - blocks next nodes
  - repeated errors here
  - cheap and fast progress
  - foundational for other themes
  - best fit for current load

### 8. Meaningful Day

- A day is counted as successful if at least one is true:
  - one main step completed;
  - one maintenance step plus one closed error completed;
  - one short daily session completed fully.

## Rationale

This decision package protects the MVP from two common failure modes:

1. Over-generic modeling that hides real differences between learning, habits, projects, and review.
2. Over-specialized subsystem sprawl before the core product loop is validated.

The chosen approach keeps one shared node-centered product model while allowing the recommendation layer to stay honest, interpretable, and useful.

## Consequences

### Positive

- Recommendation layer stays explainable and domain-realistic.
- Migration remains compatible with legacy card usage.
- Product scope stays centered on the next-right-action loop.
- Habits and projects can exist in MVP without demanding separate full subsystems.
- Future PRs get a stable product-decision baseline.

### Negative

- Schema and application logic need explicit per-node-type behavior.
- Some edge cases remain deferred, especially around automatic card migration and risk calibration.
- UI has to render explanation reasons consistently to avoid black-box feel.

### Risks

- If per-type behavior is modeled with too many nullable fields, the schema will degrade quickly.
- If error-based reprioritization is too aggressive, recommendations may become noisy.
- If explainability is reduced to internal metadata rather than visible UI reasons, trust will drop.

## Implementation Notes

- Treat these decisions as baseline contracts for PR1-PR5 planning and implementation.
- Keep schema additive-first during migration.
- Prefer compact decision tables or calculators by node type over one universal formula.
- Do not introduce a dedicated project module in the first wave.
- Do not replace the legacy card flow before node-centered workflows become useful.

## Related Task Artifacts

- [tasks/brain-gainz/01-development-os-adaptation/plan.md](../../tasks/brain-gainz/01-development-os-adaptation/plan.md)
- [tasks/brain-gainz/01-development-os-adaptation/README.md](../../tasks/brain-gainz/01-development-os-adaptation/README.md)
- [docs/archive/task-system-legacy/01-development-os-adaptation](../archive/task-system-legacy/01-development-os-adaptation)

## References

- [docs/engineering-standards.md](../engineering-standards.md)
