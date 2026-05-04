# 10 Tests And QA

## Status

`planned`

## Goal

Protect the existing map while adding campaign and XP systems.

## Functional Checks

- app opens to campaign menu
- developer main campaign exists
- developer main campaign has seeded stats
- new user campaign can be created
- new user campaign has a usable default stat path
- opening a campaign shows `Now`, `Map`, and `Wind Rose`
- switching campaigns changes visible data
- creating nodes writes into selected campaign
- completing nodes grants XP once
- `done -> active / paused` and undoing completion remove or deactivate XP
- stat levels update from XP
- wind rose routes stat to branch to map
- campaign menu offers one-click continue for last campaign
- archived campaign does not appear as one-click continue target
- archived user campaign can be restored
- developer main campaign cannot be archived or become unreachable

## Regression Checks

- current map creation still works
- direct node editing still works
- graph edge creation still works
- layers mode still works
- free canvas and layers work after entering through stat -> branch -> map
- map shortcuts still respect text inputs
- no cross-campaign data appears
- console has no warnings or errors during main flows

## High-Risk Acceptance Tests

- migration can run twice without creating a second developer main campaign
- partially migrated database resumes without losing old map data
- two campaigns with same-shaped nodes/actions/sessions do not leak data into each other
- completion in campaign A does not change XP or `Now` state in campaign B
- repeated completion of the same node creates one active XP grant
- completion through `Now`, map, and editor share the same XP idempotency rule
- archive, unarchive, done-to-active, undo completion, and undo archive follow the ledger state rules
- `done -> active / paused` deactivates XP
- unarchiving completed node preserves one existing XP grant and creates no duplicate
- branch stat reassignment does not silently rewrite historical XP
- stale selected campaign id falls back to campaign menu or last valid campaign
- completion in branch without primary stat creates no XP grant and shows compact warning
- statless campaign empty state does not look broken
- wind rose and detail panel pass desktop and mobile visual-density review

## Done When

- unit tests cover campaign routing, stat XP, level calculation, and double-grant prevention
- integration or browser checks cover campaign menu, campaign switch, and wind rose navigation
- existing map tests still pass
- manual QA confirms the UI stays visual-first
