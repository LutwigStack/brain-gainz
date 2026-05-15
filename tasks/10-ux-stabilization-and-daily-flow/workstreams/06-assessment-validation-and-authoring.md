# 06 Assessment Validation And Authoring

## Status

`planned`

## Goal

Make the assessment lifecycle understandable: answer, check, attempt, verified mastery, XP / route credit.

## Scope

- replace contradictory disabled hints with one validation state near `Проверить`
- make failed attempts look like learning outcomes, not application errors
- clarify strict exact / number / contains / checklist inputs
- clarify manual / LLM evidence requirements
- make self-marked progress visibly separate from verified assessment progress
- improve check metadata authoring structure:
  - check type
  - task prompt
  - expected answer / criterion
  - preview summary
- keep raw metadata hidden from normal users

## UX Direction

Assessment should tell the user:
- what input is expected
- what evidence is required
- why `Проверить` is disabled
- whether the attempt was accepted or not accepted
- whether progress counted for XP / route completion

## Done When

- filling only answer explains that verifier evidence is missing when required
- filling evidence enables `Проверить` and removes contradictory copy
- failed attempt state is visible as `not accepted` / retry, not as system failure
- checklist checks can be completed without understanding stored JSON
- strict checks show exact expected input type
- manual / LLM checks clearly require verifier result / verdict / evidence
- editor authoring flow groups check fields around the selected check type

## High-Risk Scenarios

- strict auto-checkable task
- manual strict task
- LLM-assisted task
- checklist with required and optional items
- node with no check metadata
- node in route requiring verified mastery

