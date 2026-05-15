# Plan

## Intent

Stabilize the current BrainGainz user experience so the existing campaign, Today, map, route, mastery, assessment, and Wind Rose systems become usable by a user who is not already familiar with the implementation.

This is a product-clarity pass, not a new feature layer.

## Product Direction

- Campaign selection remains the first step.
- `Today` should answer: what should I do next, why, and where do I go?
- The map should be editable through visible controls, with shortcuts as secondary acceleration.
- The inspector should expose one task at a time.
- Assessment should feel like a learning attempt lifecycle, not a form with hidden requirements.
- Wind Rose should stay a visual navigation surface into stats, branches, and map focus.
- Visual density should support scanning and daily use.

## Technical Direction

- Fix transaction paths before UI polish that depends on those paths.
- Keep changes additive and scoped to existing components/services.
- Do not change XP or mastery semantics unless a bug blocks the user-facing flow.
- Prefer compact state and grouping over longer explanatory text.
- Preserve existing map shortcuts and context menus while adding visible controls.
- Keep large graph improvements focused on overview/readability, not a new graph model.

## Delivery Order

1. trust and error boundaries
2. campaign menu entry clarity
3. `Today` primary work loop
4. map editing affordances
5. inspector task mode split
6. assessment validation and authoring
7. map overview and route readability
8. wind rose branch polish
9. visual density and mobile pass
10. UX regression QA

## First Usable Slice

The smallest valuable correction:
- assessment fail/pass no longer throws raw transaction errors
- `Today` route CTA is disabled or redirected when no valid route action exists
- assessment validation has one clear state near `Проверить`
- console is clean for those covered flows

## Risks

- hiding a real persistence bug behind nicer error text
- redesigning `Today` without fixing invalid route actions first
- adding map toolbar state that conflicts with Pixi canvas interactions
- moving inspector blocks without preserving existing edit / route / mastery behavior
- making assessment authoring more verbose instead of clearer
- optimizing large graph view in a way that breaks focused branch navigation
- treating mobile as a separate app instead of a compact form of the same workflows

## Manual Review Baseline

This epic is based on the UX review run against `http://127.0.0.1:5178` on 2026-05-13 / 2026-05-14 local project state.

Observed high-risk failures:
- `cannot rollback - no transaction is active` in user-facing UI
- `Failed to submit assessment attempt` in console
- `Failed to start specialization` in console
- route CTA active when no usable route action exists
- map create/connect actions only discoverable by trial

