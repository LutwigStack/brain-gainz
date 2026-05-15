# 01 Destructive Action Safety

## Status

`planned`

## Goal

Prevent accidental data loss from map and inspector destructive actions, starting with node archive.

## Scope

- protect `Archive node` from one-click accidental activation
- add a shared destructive-action interaction pattern for map toolbar and inspector actions
- provide cancel and confirm states that are visually distinct from normal edit tools
- show an undo affordance after successful archive
- provide an obvious restore path for archived nodes in the relevant campaign/structure context
- keep system/developer campaign actions especially hard to trigger accidentally
- preserve existing archive behavior and data model where possible

## UX Direction

Destructive actions should feel different from editing modes.

Archive should answer:
- which node will be archived?
- what will happen to it?
- how do I cancel?
- how do I undo or restore?

Avoid:
- a destructive toolbar button mixed with normal map tools at the same visual weight
- archive happening during exploratory review clicks
- hiding restore behind an unknown data model

## Done When

- pressing `Archive node` does not archive immediately without confirmation or a deliberate second step
- confirmation names the selected node
- cancel returns to the previous map/inspector state without mutation
- successful archive shows an undo action
- undo restores the archived node and refreshes map, inspector, and campaign counts
- archived nodes can be restored after the toast is gone
- system/developer campaign archive is either blocked, read-only, or clearly confirmed as a higher-risk action
- no raw persistence errors leak into the UI for archive/restore

## High-Risk Scenarios

- selected node belongs to the system/developer campaign
- selected node has edges or route membership
- user switches structure or campaign after archive but before undo
- archived node was the current inspector focus
- mobile toolbar has less room for destructive labels

## Suggested Tests

- unit/store test for archive + restore preserving node identity and campaign scope
- UI component test or integration smoke for confirm/cancel/undo
- browser QA: click archive once and verify node count does not change until confirmation
- browser QA: archive, undo, reload, verify node count and restored node visibility
