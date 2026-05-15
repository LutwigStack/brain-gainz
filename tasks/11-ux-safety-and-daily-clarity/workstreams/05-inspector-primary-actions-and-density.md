# 05 Inspector Primary Actions And Density

## Status

`planned`

## Goal

Make each inspector tab expose one obvious primary action while moving metadata and secondary details out of the way.

## Scope

- review `Overview`, `Route`, `Check`, and `Graph` tab layouts
- define one primary action per tab where applicable
- move ID/date/debug-like metadata into compact details
- reduce competition between edit, duplicate, archive, self-mark, route, and assessment actions
- strengthen visual distinction between verified mastery and self-marked progress
- keep destructive actions protected by the shared destructive-action pattern

## UX Direction

The inspector should feel like the selected node control panel, not a dump of every property.

Each tab should answer:
- what is this node?
- what can I do in this tab?
- what state changed?

## Done When

- `Overview` has a clear next action or compact summary
- `Route` focuses on add/update/remove route state
- `Check` focuses on assessment and verified mastery
- `Graph` focuses on relationships and graph stats
- ID/date are not primary visual elements
- archive remains visible but not easy to trigger accidentally
- mobile inspector remains readable below the map

## High-Risk Scenarios

- selected node has no check metadata
- selected node is already in route
- selected node is not in route
- selected node is archived or read-only
- selected node has many incoming/outgoing edges

## Suggested Tests

- browser QA for each inspector tab on a normal node
- browser QA for route node vs non-route node
- browser QA for archived/read-only node state
- mobile screenshot QA for inspector below map
