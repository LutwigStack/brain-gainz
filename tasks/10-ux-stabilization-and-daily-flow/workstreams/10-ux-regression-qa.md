# 10 UX Regression QA

## Status

`planned`

## Goal

Create a repeatable manual UX QA pass for the stabilized daily flow and map editing experience.

## Scope

- campaign menu walkthrough
- Today empty and populated states
- route CTA states
- map Free Canvas editing
- map Layers editing
- inspector overview / route / assessment / graph modes
- assessment pass and fail attempts
- check metadata authoring smoke pass
- Wind Rose stat / branch / map transition
- large graph overview
- mobile 390px pass
- console warning / error check

## High-Risk Acceptance Tests

Campaign Menu:
- app starts at campaign selection
- developer/system campaign is distinguishable
- user campaign open/archive/restore are understandable
- archived campaign is not the continue target

Today:
- empty campaign has one concrete next action
- populated campaign shows next node above secondary status
- route CTA is disabled or redirected when no route exists
- verified progress differs from self-marked progress

Map:
- user can create a node using visible controls
- user can connect two nodes using visible controls
- user can delete an edge or archive a node without hidden-only gestures
- Layers mode makes the target parent / layer clear
- large graph opens in readable overview

Inspector:
- selected node identity is clear
- route controls are not mixed into assessment controls
- assessment validation is clear before and after filling evidence
- failed attempt looks like a normal learning result
- check authoring can configure exact, number, contains, checklist, manual strict, and LLM-assisted checks

Wind Rose:
- selected stat shows branches
- branch target is clear before opening
- opening a branch focuses the expected map area

## Done When

- QA checklist is documented and current
- screenshots are captured for key before/after states
- console errors and warnings are recorded
- all High findings from the UX review have regression coverage
- `npm run lint` passes
- `npm run build` passes

