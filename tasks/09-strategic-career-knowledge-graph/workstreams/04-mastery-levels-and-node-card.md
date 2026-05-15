# Workstream 04: Mastery Levels And Node Card

## Goal

Move node progress from simple completion toward visible mastery levels and compact learning mission cards.

## Scope

Includes:
- mastery levels
- node mastery state
- mapping from existing completion to mastery
- compact node card structure
- retention / weakening indicator

Excludes:
- full spaced repetition scheduler
- complex grading rubric editor
- long textual lesson authoring UI

## Mastery Levels V1

Recommended levels:
1. `seen`
2. `understood`
3. `remembered`
4. `applied`
5. `confirmed`
6. `retained`

Each level should have:
- icon
- short label
- visual color / glow
- check requirement, if applicable

## Node Card Direction

Node card should show:
- node title
- node type
- current mastery
- next required action
- compact "understand / apply / confirm / retain" blocks
- reward preview
- linked prerequisites and unlocks

Do not make the node card a wall of text. Long explanation, references, and task details should open on demand.

## Migration Rule

Existing `done` state maps to `confirmed` in v1.

Mapping:
- old active node -> no mastery or `seen`
- old completed node -> `confirmed`

This mapping must be explicit in migration/adapter code.

## Mastery Event Ledger

Mastery should be event-backed, not a second ad hoc counter.

Recommended concept:
- `mastery_events`

Fields:
- campaign id
- node id
- optional specialization id
- optional knowledge node id
- mastery level
- source evidence id, if applicable
- source action / mutation
- idempotency key
- active / reversed state
- created_at
- reversed_at

Rules:
- mastery above `seen` requires passed evidence or a legacy migration event
- repeated evidence cannot create duplicate mastery events for the same node, level, and source
- XP grants from task 08 should reference mastery events or use compatible grant reasons
- XP totals and mastery state must not be updated as unrelated side effects
- `done -> active / paused` deactivates the completion-linked XP grant and reverses only completion-derived legacy `confirmed` mastery events
- assessment-backed mastery events are not reversed by `done -> active / paused`
- route counting uses active mastery events; if only the reversed legacy `confirmed` event existed, the route no longer counts the node as `confirmed`
- undo restores both XP ledger and mastery event state for the reverted operation
- retry can create a new assessment attempt, but not duplicate mastery / XP unless it produces a new valid event

## Done When

- Nodes can display mastery level.
- Existing completed nodes map consistently to `confirmed`.
- Mastery is backed by idempotent events.
- Node card has a compact next-action layout.
- Retention / weakening can be shown visually, even if scheduling is simple in v1.
- Map and `Today` can both use mastery state.
