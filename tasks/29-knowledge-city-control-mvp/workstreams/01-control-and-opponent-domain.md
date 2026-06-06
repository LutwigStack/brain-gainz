# 01 Control And Opponent Domain

## Status

`done`

## Goal

Create the minimum domain model for knowledge city control and one campaign opponent.

## Scope

- derived node control states
- derived object control states
- campaign opponent persistence
- migration and store boundaries
- tests for deterministic state derivation

## Requirements

- Add one opponent per personal campaign, not per template.
- Templates and archived campaigns must not run opponent turns.
- Keep control state derived from existing mastery, attempts, weak spots, route membership, and retention age where possible.
- Persist only opponent state needed for XP/turn resolution.
- Use constants for retention thresholds and XP values.
- No random simulation in MVP.

## Proposed Domain API

- `getCampaignControlSnapshot(campaignId)`
- `getNodeControlState(campaignId, nodeId)`
- `resolveOpponentTurn(campaignId, now)`
- `getCampaignOpponentSnapshot(campaignId)`

## Done When

- Tests cover all node states:
  - unclaimed
  - scouted
  - controlled
  - fortified
  - weakened
  - contested
  - lost
- Tests cover opponent row creation for personal campaigns.
- Tests prove templates and archived campaigns do not run opponent turns.
- Existing campaign tests still pass.


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
