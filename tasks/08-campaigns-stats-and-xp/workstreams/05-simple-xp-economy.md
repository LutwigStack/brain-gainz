# 05 Simple XP Economy

## Status

`planned`

## Goal

Turn completed work into stat progress with simple, predictable XP rules.

## Scope

- XP grants from node completion
- XP grant ledger
- derived stat XP totals
- derived stat levels
- undo / state-transition / unarchive behavior
- double-grant prevention

## XP Rules V1

- normal node: 10 XP
- important node: 25 XP
- milestone / check node: 50 XP
- archive gives no XP
- repeated completion of the same already-completed node gives no extra XP
- completion in a branch without `primary_stat_id` creates no XP grant and surfaces an unassigned-stat warning
- changing a completed node back to `active` or `paused` removes or deactivates its XP grant
- unarchiving an archived completed node preserves the existing XP grant and does not create another grant
- undo restores XP to the previous state

## XP Tier Mapping V1

- default node: 10 XP
- `importance = high`: 25 XP
- `type in ('milestone', 'check')`: 50 XP
- precedence: milestone / check beats importance, importance beats default
- if the current model does not have these fields yet, add explicit fields before XP ships; do not infer tier from title text

## XP Ledger Contract

- XP totals are derived from active grant rows.
- Stat XP is not stored as the source of truth on the stat row.
- Use `stat_xp_grants` or an equivalent ledger.
- Minimum unique key:
  - `campaign_id`
  - `node_id`
  - `grant_reason`
- Required fields:
  - `campaign_id`
  - `node_id`
  - `branch_id`
  - `stat_id`
  - `grant_reason`
  - `xp_amount`
  - `active`
  - `created_at`
  - `reversed_at`
- Repeated completion upserts or reuses the existing grant instead of inserting another active grant.
- No grant row is created when the branch has no primary stat.

## Completion State Rules V1

- Completion means one explicit node transition into `done`.
- `active -> done` creates or reactivates one grant.
- `paused -> done` creates or reactivates one grant.
- `active -> done` in a branch without `primary_stat_id` creates no grant and shows a compact visual warning.
- `done -> active` deactivates the grant.
- `done -> paused` deactivates the grant.
- Archive alone never creates XP.
- Archive of an already completed node preserves its grant in v1 unless product later decides archived completed work should stop counting.
- Unarchiving an archived completed node preserves the existing grant and must not create duplicate XP.
- Undo restores the previous ledger state for the reverted operation.
- Branch stat reassignment does not mutate historical grants silently in v1; recalculation must be an explicit future action.

## Level Curve V1

- level 1: 0 XP
- level 2: 100 XP
- level 3: 250 XP
- level 4: 450 XP
- level 5: 700 XP
- later levels may use a formula after level 5

## Done When

- completing a node grants XP to the branch primary stat
- completing a node in a branch without primary stat creates no XP grant and makes the missing stat visible
- XP is not granted twice for the same completion
- `done -> active / paused` or undoing completion updates stat XP correctly
- unarchiving archived completed node preserves one existing grant
- stat level is derived from XP
- wind rose receives current stat progress without manual edits
- repeated completion through `Now`, map, or editor results in one active grant
- archive, unarchive, done-to-active, and undo behavior follows the state rules above
