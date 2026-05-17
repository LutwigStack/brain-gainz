# 03 Map Inspector And Route

## Status

`done`

## Goal

Translate map, route overview, and node inspector without making controls longer or less clear.

## Scope

- map mode names
- route overview labels
- route branch counters
- current step labels
- node inspector tabs
- mastery labels
- self-marked and verified progress labels
- author/learner mode labels
- graph/detail labels visible to users

## Done When

- map and inspector can be used without English UI labels
- route overview still fits at `1280x900`
- mobile map does not gain horizontal overflow
- author-only technical details remain separated from learner mode

## Suggested Tests

- browser QA route overview
- browser QA selected node inspector
- browser QA author mode check
- `npm run lint`
- `npm run build`
