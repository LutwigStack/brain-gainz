# 04 Assessment Language And Progress Copy

## Status

`planned`

## Goal

Make assessment feel like a learning attempt lifecycle instead of a technical verifier form.

## Scope

- replace primary-surface technical labels with user-facing labels
- move verifier IDs, raw evidence, and implementation details behind advanced/details UI
- keep strict/manual/LLM precision for authors and power users
- make disabled states read as one current validation state
- keep failed attempt language as a normal learning result
- connect pass/fail outcome to verified mastery/XP in copy and visual state

## UX Direction

Primary assessment UI should use language like:
- answer
- check result
- evidence of checking
- criteria for passing
- attempt saved
- verified progress

Technical terms such as `verifier result`, `verdict`, `evidence payload`, `strict exact`, and raw result IDs should not dominate the primary path.

## Done When

- manual/LLM assessment starts with a human-readable expectation
- raw verifier/result IDs are optional advanced fields
- disabled `Check` or pass buttons show one clear reason near the action
- failed attempt is styled as an attempt result, not an app error
- passed assessment clearly updates verified mastery/XP
- authoring still supports exact, number, contains, checklist, manual strict, and LLM-assisted checks

## High-Risk Scenarios

- strict exact/number/contains/checklist checks
- manual strict check requiring external evidence
- LLM-assisted check requiring evidence/result
- user submits failed attempt with no verifier evidence
- user passes assessment and expects XP

## Suggested Tests

- component/model tests for validation reason selection
- browser QA for strict exact, checklist, manual, and LLM states
- browser QA for failed attempt vs app error styling
- browser QA for verified mastery/XP change after pass
