---
tags:
  - workspace
  - governance
  - frontend
  - review
---
# Frontend Review Rubric

Reusable engineering rubric for frontend-system reviews across repositories such as `luma-tree`.

Use it when the goal is not just style feedback, but an honest judgment of architecture quality, ownership, contracts, reuse, theming, responsiveness, testing, and change cost.

## Scoring Scale

Score each category from `0` to `10`.

- `0-3`: broken, dangerous, or architecturally misleading
- `4-5`: works, but engineering quality is weak
- `6-7`: acceptable working level
- `8-9`: strong engineering implementation
- `10`: exemplary and broadly reusable

## Categories

### 1. Source Of Truth / Ownership

- `10`: every important state has one owner; there are no competing runtime truths across store, props, local state, or derived copies
- bad signs:
  - `config` and `savedConfig` both acting as truth
  - hook-local runtime flags that multiple surfaces depend on
  - optimistic state updates with no rollback or reconcile path

### 2. Contract Quality

- `10`: props and hooks describe domain entities or stable view-models, not a screen-specific bag of fields
- bad signs:
  - semantic meaning hidden in labels, strings, or numeric suffixes
  - APIs that only work for one screen or one layout
  - contracts that cannot be reused without adapter glue

### 3. View / Data / Domain Separation

- `10`: UI receives stable domain contracts or ready view-models and does not synthesize domain truth locally
- bad signs:
  - UI computes synthetic summaries, graph values, matrix colors, or backend-derived badges on its own
  - rendering code directly owns business logic

### 4. Reuse Without Forks

- `10`: the same component works across containers without becoming a second product
- bad signs:
  - `variant="workbench"` or similar turning into separate behavior
  - cloned components instead of composition
  - layout variants carrying domain semantics

### 5. State Machine / Failure Honesty

- `10`: loading, hydrating, ready, error, unavailable, stale, and exact/non-exact states are explicit and truthful
- bad signs:
  - `null` meaning both "not loaded" and "not present"
  - backend fetch failure rendered as "no data"
  - UI claiming certainty when backend ownership is unknown

### 6. Theme / Tokens / Visual System

- `10`: colors, spacing, radii, typography, shell surfaces, and presets live in a real theme layer
- bad signs:
  - raw `rgba(...)` and literal gradients scattered through JSX
  - new design replacing old themes instead of landing as a separate preset
  - mixed concerns between mode, surface preset, and palette overrides

### 7. Responsiveness / Container Resilience

- `10`: layout responds to the actual container and degrades predictably in narrow states
- bad signs:
  - `window.innerWidth`, `100vh`, and hardcoded offsets inside reusable panels
  - split panes and embedded hosts breaking the layout

### 8. Testability And Proof

- `10`: critical contracts are covered by behavior-oriented tests and browser proof where the real DOM matters
- bad signs:
  - snapshot-only confidence
  - jsdom green while browser smoke is red
  - stale expectations that permanently fail or no longer reflect implementation

### 9. Performance / Side Effects / Lifecycle

- `10`: side effects are localized, async paths are guarded, and rendering/update paths avoid churn
- bad signs:
  - hidden effects inside hooks
  - unguarded promises after unmount
  - resize storms, unnecessary recomputation, or effect loops

### 10. Change Cost / Portability

- `10`: the screen can move to another container, another provider, or another theme preset without rewriting the state machine
- bad signs:
  - transfer requires mock data, local adapters, timers, copied geometry, and cleanup of old logic
  - visual migration cannot happen without rewriting behavior

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
   - the same state lives in store, local state, props, and derived copies at the same time
2. `Spaghetti dependencies`
   - one component knows too much about backend, routing, theme, keyboard shortcuts, timers, and side effects
3. `Fragile contracts`
   - props/hooks describe a one-off screen payload instead of a domain contract
4. `Implicit semantics`
   - logic depends on heuristics such as `label.includes("125")`
5. `View/data-model mixing`
   - UI computes summaries, colors, graph values, or derived badges that belong in the domain layer
6. `Forks instead of reuse`
   - variants effectively create a second product
7. `Magic numbers`
   - layout depends on fixed offsets, `vw`, `vh`, hardcoded rem values, or unowned constants instead of container rules or tokens
8. `Hidden side effects`
   - hooks that look read-only but actually write state, fetch, start timers, or mutate external systems
9. `Temporal coupling`
   - code works only if operations happen in one fragile order
10. `Optimistic mutation without rollback`
    - frontend commits a change before backend truth and has no honest reconcile path
11. `Dead code / competing models`
    - old panels, state models, or files remain in the tree and still misrepresent how the system works
12. `Tests on implementation detail`
    - jsdom stays green while browser behavior is red, or tests validate internal proxies instead of real behavior
13. `Unparameterized theming`
    - new design lands by replacing the old one instead of going through tokens or presets
14. `Illegal state representable`
    - types and state shape allow impossible or contradictory states to exist
15. `Race conditions / stale async overwrite`
    - a slower async response can overwrite newer state or user intent
16. `God components / low cohesion`
    - one component owns too many unrelated responsibilities and cannot be reasoned about locally
17. `Accessibility debt`
    - keyboard, focus, ARIA semantics, or contrast are missing or unreliable
18. `Unsafe persistence / missing migrations`
    - persisted settings or state are not versioned or migrated safely as the model evolves

## Required Review Output

Reviews using this rubric should answer in this order:

1. `Blocking to ship`
2. `Important after ship`
3. `Cleanup / tech debt`
4. `Mandatory smell checklist`
5. `Score by all 10 categories`
6. `Overall verdict`
7. `Migration risk / change cost`

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
Do a frontend review using Frontend Review Rubric.

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
   - change / migration cost
6. If context is missing, list assumptions explicitly.

Mandatory smells to check:
1. Duplicate truth
2. Spaghetti dependencies
3. Fragile contracts
4. Implicit semantics
5. View/data-model mixing
6. Forks instead of reuse
7. Magic numbers
8. Hidden side effects
9. Temporal coupling
10. Optimistic mutation without rollback
11. Dead code / competing models
12. Tests on implementation detail
13. Unparameterized theming
14. Illegal state representable
15. Race conditions / stale async overwrite
16. God components / low cohesion
17. Accessibility debt
18. Unsafe persistence / missing migrations

Rubric categories:
1. Source of truth / ownership
2. Contract quality
3. View / data / domain separation
4. Reuse without forks
5. State machine / failure honesty
6. Theme / tokens / visual system
7. Responsiveness / container resilience
8. Testability and proof
9. Performance / side effects / lifecycle
10. Change cost / portability
```

## Related

- [README.md](../README.md)
- [task-system.md](task-system.md)
- [obsidian-conventions.md](obsidian-conventions.md)
