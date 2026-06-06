# 02 Shell Today And Daily Tasks

## Status

`done`

## Goal

Make the main shell, Campaign Menu, Today, and daily task loop Russian-first.

## Scope

- left navigation
- top context bar
- Campaign Menu actions
- Today goal block
- daily task cards
- Daily Run start, active, ready, and completed states
- task outcomes: complete, another pass, skip, defer
- right rail race/city/opponent labels
- empty states and disabled reasons

## Done When

- no obvious English labels remain on Campaign Menu and Today
- task outcomes use short Russian action labels
- `ready to finish`, `current`, `recovery`, `deferred`, and similar states are translated consistently
- mobile `390x844` still fits button text

## Suggested Tests

- `npm run test`
- `npm run lint`
- `npm run build`
- browser QA Campaign Menu desktop/mobile
- browser QA Today active and ready-to-finish states


## Legacy naming

This file uses legacy terms (`atlas`, `city`, `POE`, `Карта задач`, `Атлас знаний`, `город`) that were current before the cosmic direction was confirmed in epic 40. The user-facing language is now `Карта знаний`; see epic 48 (this epic) for the documentation migration. The file is kept for context and is superseded by epics 40 and 47.
