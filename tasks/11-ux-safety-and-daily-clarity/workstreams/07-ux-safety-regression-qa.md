# 07 UX Safety Regression QA

## Status

`planned`

## Goal

Verify that the UX safety and daily clarity slice works through real browser interaction, not only code inspection.

## Scope

- run manual browser QA on the final slice
- capture console warnings/errors
- capture screenshots for key states
- verify destructive actions are protected
- verify `Today` state clarity for representative campaigns
- verify large graph overview and focus behavior
- verify assessment primary language and advanced details
- verify Campaign Menu, Wind Rose, and mobile polish
- update or create a regression checklist artifact under this epic

## Required Environment

- reuse existing dev server when available
- do not kill unrelated processes
- if the preferred port is occupied, choose a free port and record it
- desktop viewport around `1280x900`
- mobile viewport around `390x844`
- browser console capture before and after smoke

## Acceptance Checklist

- Campaign Menu starts at campaign selection.
- System/developer campaign is distinguishable from personal campaigns.
- Node archive cannot happen from a single accidental toolbar click.
- Archive confirm/cancel/undo/restore all work.
- `Today` explains non-empty campaign with no active daily task.
- `Today` active route has one dominant next action.
- Large graph opens in readable overview.
- Wind Rose branch navigation focuses the expected map area.
- Inspector tabs have clear primary actions.
- Assessment hides technical verifier details from the primary path.
- Mobile header/nav and map working area remain usable.
- Console has no unexpected warnings/errors.

## Done When

- QA checklist records commit, dev server port, viewport sizes, command results, and console result
- screenshots are captured for before/after high-risk states
- all High findings from this epic have regression coverage
- `npm run test`, `npm run lint`, and `npm run build` are recorded
- any remaining findings are explicitly listed with severity and next action
